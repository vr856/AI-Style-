"use client";

import { LoadingSVG } from "@/components/button/LoadingSVG";
import { ChatMessageType } from "@/components/chat/ChatTile";
import { ColorPicker } from "@/components/colorPicker/ColorPicker";
import { AudioInputTile } from "@/components/config/AudioInputTile";
import { ConfigurationPanelItem } from "@/components/config/ConfigurationPanelItem";
import { NameValueRow } from "@/components/config/NameValueRow";
import {
  PlaygroundTab,
  PlaygroundTabbedTile,
  PlaygroundTile,
} from "@/components/playground/PlaygroundTile";
import { useConfig } from "@/hooks/useConfig";
import { TranscriptionTile } from "@/transcriptions/TranscriptionTile";
import {
  BarVisualizer,
  VideoTrack,
  useConnectionState,
  useDataChannel,
  useLocalParticipant,
  useRoomInfo,
  useTracks,
  useVoiceAssistant,
  TrackToggle,
} from "@livekit/components-react";
import { ConnectionState, LocalParticipant, Room, Track } from "livekit-client";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import tailwindTheme from "../../lib/tailwindTheme.preval";
import { motion } from "framer-motion";
import styles from '../../styles/playground.module.css';

export interface PlaygroundProps {
  logo?: ReactNode;
  themeColors: string[];
  onConnect: (connect: boolean, opts?: { token: string; url: string }) => void;
  onClose: () => void;
}

export default function Playground({
  logo,
  themeColors,
  onConnect,
  onClose,
}: PlaygroundProps) {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const { config, setUserSettings } = useConfig();
  const { name } = useRoomInfo();
  const [transcripts, setTranscripts] = useState<ChatMessageType[]>([]);
  const { localParticipant } = useLocalParticipant();

  const voiceAssistant = useVoiceAssistant();

  const roomState = useConnectionState();
  const tracks = useTracks();

  // Initialize room when component mounts
  useEffect(() => {
    if (!room) {
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          simulcast: true,
          videoSimulcastLayers: [
            { resolution: 'hd', width: 1280, height: 720, encoding: { maxBitrate: 1_500_000, maxFramerate: 30 } },
            { resolution: 'sd', width: 640, height: 360, encoding: { maxBitrate: 500_000, maxFramerate: 30 } },
          ],
        },
      });
      setRoom(newRoom);
    }

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, []);

  // Handle track enabling/disabling
  useEffect(() => {
    if (roomState === ConnectionState.Connected && localParticipant && room) {
      const enableTimer = setTimeout(async () => {
        try {
          // Enable camera if needed
          if (config.settings.inputs.camera) {
            await localParticipant.setCameraEnabled(true, { resolution: { width: 1280, height: 720 } });
          }
          
          // Enable microphone if needed
          if (config.settings.inputs.mic) {
            await localParticipant.setMicrophoneEnabled(true, {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            });
          }
        } catch (error) {
          console.error('Failed to enable tracks:', error);
        }
      }, 1000);

      return () => clearTimeout(enableTimer);
    }
  }, [roomState, localParticipant, room, config.settings.inputs]);

  // Handle reconnection
  useEffect(() => {
    if (roomState === ConnectionState.Disconnected && !isReconnecting && room) {
      setIsReconnecting(true);
      const reconnectTimer = setTimeout(async () => {
        try {
          await onConnect(true);
        } finally {
          setIsReconnecting(false);
        }
      }, 2000);

      return () => clearTimeout(reconnectTimer);
    }
  }, [roomState, onConnect, isReconnecting, room]);

  // Cleanup tracks on unmount
  useEffect(() => {
    return () => {
      if (localParticipant) {
        localParticipant.setCameraEnabled(false);
        localParticipant.setMicrophoneEnabled(false);
      }
    };
  }, [localParticipant]);

  const agentVideoTrack = tracks.find(
    (trackRef) =>
      trackRef.publication.kind === Track.Kind.Video &&
      trackRef.participant.isAgent
  );

  const localTracks = tracks.filter(
    ({ participant }) => participant instanceof LocalParticipant
  );
  const localVideoTrack = localTracks.find(
    ({ source }) => source === Track.Source.Camera
  );
  const localMicTrack = localTracks.find(
    ({ source }) => source === Track.Source.Microphone
  );

  const onDataReceived = useCallback(
    (msg: any) => {
      if (msg.topic === "transcription") {
        const decoded = JSON.parse(
          new TextDecoder("utf-8").decode(msg.payload)
        );
        let timestamp = new Date().getTime();
        if ("timestamp" in decoded && decoded.timestamp > 0) {
          timestamp = decoded.timestamp;
        }
        setTranscripts([
          ...transcripts,
          {
            name: "You",
            message: decoded.text,
            timestamp: timestamp,
            isSelf: true,
          },
        ]);
      }
    },
    [transcripts]
  );

  useDataChannel(onDataReceived);

  const localVideoContent = useMemo(() => {
    if (!localVideoTrack) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-gray-700 text-center h-full w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p>Camera is off</p>
        </div>
      );
    }

    return (
      <VideoTrack
        trackRef={localVideoTrack}
        className="w-full h-full object-cover"
      />
    );
  }, [localVideoTrack]);

  const audioTileContent = useMemo(() => {
    const disconnectedContent = (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-700 text-center w-full">
        No Agent Available. Re-Connect to get started.
      </div>
    );

    const waitingContent = (
      <div className="flex flex-col items-center gap-2 text-gray-700 text-center w-full">
        <LoadingSVG />
        Waiting for An Agent To Become Online
      </div>
    );

    const visualizerContent = (
      <div
        className={`flex items-center justify-center w-full h-48 [--lk-va-bar-width:30px] [--lk-va-bar-gap:20px] [--lk-fg:var(--lk-theme-color)]`}
      >
        <BarVisualizer
          state={voiceAssistant.state}
          trackRef={voiceAssistant.audioTrack}
          barCount={5}
          options={{ minHeight: 20 }}
        />
      </div>
    );

    if (roomState === ConnectionState.Disconnected) {
      return disconnectedContent;
    }

    if (!voiceAssistant.audioTrack) {
      return waitingContent;
    }

    return visualizerContent;
  }, [
    voiceAssistant.audioTrack,
    config.settings.theme_color,
    roomState,
    voiceAssistant.state,
  ]);

  const chatTileContent = useMemo(() => {
    if (voiceAssistant.audioTrack) {
      return (
        <TranscriptionTile
          agentAudioTrack={voiceAssistant.audioTrack}
          accentColor={config.settings.theme_color}
        />
      );
    }
    return <></>;
  }, [config.settings.theme_color, voiceAssistant.audioTrack]);

  const settingsTileContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 h-full w-full items-start overflow-y-auto">
        <ConfigurationPanelItem title="Settings">
          {localParticipant && (
            <div className="flex flex-col gap-2">
              <NameValueRow
                name="Agent Id"
                value={name}
                valueColor={`${config.settings.theme_color}-500`}
              />
              <NameValueRow
                name="Participant Id"
                value={localParticipant.identity}
              />
            </div>
          )}
        </ConfigurationPanelItem>
        <ConfigurationPanelItem title="Status">
          <div className="flex flex-col gap-2">
            <NameValueRow
              name="Room connected"
              value={
                roomState === ConnectionState.Connecting ? (
                  <LoadingSVG diameter={16} strokeWidth={2} />
                ) : (
                  roomState.toUpperCase()
                )
              }
              valueColor={
                roomState === ConnectionState.Connected
                  ? `${config.settings.theme_color}-500`
                  : "gray-500"
              }
            />
            <NameValueRow
              name="Agent connected"
              value={
                voiceAssistant.agent ? (
                  "TRUE"
                ) : roomState === ConnectionState.Connected ? (
                  <LoadingSVG diameter={12} strokeWidth={2} />
                ) : (
                  "FALSE"
                )
              }
              valueColor={
                voiceAssistant.agent
                  ? `${config.settings.theme_color}-500`
                  : "gray-500"
              }
            />
          </div>
        </ConfigurationPanelItem>
        {localVideoTrack && (
          <ConfigurationPanelItem
            title="Camera"
            deviceSelectorKind="videoinput"
          >
            <div className="relative">
              <VideoTrack
                className="rounded-sm border border-gray-800 opacity-70 w-full"
                trackRef={localVideoTrack}
              />
            </div>
          </ConfigurationPanelItem>
        )}
        {localMicTrack && (
          <ConfigurationPanelItem
            title="Microphone"
            deviceSelectorKind="audioinput"
          >
            <AudioInputTile
              trackRef={localMicTrack || { source: Track.Source.Microphone, participant: null }}
            />
          </ConfigurationPanelItem>
        )}
        <div className="w-full">
          <ConfigurationPanelItem title="Color">
            <ColorPicker
              colors={themeColors}
              value={config.settings.theme_color}
              onChange={(color) =>
                setUserSettings({ ...config.settings, theme_color: color })
              }
            />
          </ConfigurationPanelItem>
        </div>
      </div>
    );
  }, [
    config.settings,
    localParticipant,
    name,
    roomState,
    localVideoTrack,
    localMicTrack,
    themeColors,
    setUserSettings,
    voiceAssistant.agent,
  ]);

  let mobileTabs: PlaygroundTab[] = [
    {
      id: "camera",
      label: "Your Camera",
      content: (
        <PlaygroundTile
          className="w-full h-full grow"
        >
          {localVideoContent}
        </PlaygroundTile>
      )
    },
    {
      id: "voice",
      label: "Voice Assistant",
      content: (
        <PlaygroundTile
          className="w-full h-full grow"
        >
          {audioTileContent}
        </PlaygroundTile>
      )
    },
    {
      id: "chat",
      label: "Chat",
      content: chatTileContent,
    },
    {
      id: "settings",
      label: "Settings",
      content: (
        <PlaygroundTile
          className="h-full w-full basis-1/4 items-start overflow-y-auto flex"
        >
          <div className="flex flex-col gap-4 h-full w-full items-start overflow-y-auto">
            <ConfigurationPanelItem title="Settings">
              {localParticipant && (
                <div className="flex flex-col gap-2">
                  <NameValueRow
                    name="Agent Id"
                    value={name}
                    valueColor={`${config.settings.theme_color}-500`}
                  />
                  <NameValueRow
                    name="Participant Id"
                    value={localParticipant.identity}
                  />
                </div>
              )}
            </ConfigurationPanelItem>
          </div>
        </PlaygroundTile>
      )
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.container}
    >
      <motion.button
        className={styles.closeBtn}
        onClick={onClose}
        whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
        whileTap={{ scale: 0.9 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>

      <div className={styles.mainGrid}>
        {/* Left column */}
        <div className={styles.colLeft}>
          <div className={`${styles.videoTile} ${styles.glassEffect}`}>
            <div className="relative w-full h-full">
              {localVideoContent}
              <motion.div
                className="absolute bottom-4 right-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TrackToggle
                  source={Track.Source.Camera}
                  className={styles.controlBtn}
                />
              </motion.div>
            </div>
          </div>
          
          <div className={`${styles.audioTile} ${styles.glassEffect}`}>
            <div className="relative w-full h-full flex items-center justify-center">
              {audioTileContent}
              <motion.div
                className="absolute bottom-4 right-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TrackToggle
                  source={Track.Source.Microphone}
                  className={styles.controlBtn}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Center column */}
        <div className={styles.colCenter}>
          <div className={`${styles.chatTile} ${styles.glassEffect}`}>
            <div className="h-full flex flex-col">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Style Assistant</h2>
              </div>
              <div className={styles.scrollable}>
                {chatTileContent}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className={styles.colRight}>
          <div className={`${styles.settingsTile} ${styles.glassEffect}`}>
            <div className="h-full flex flex-col">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Settings</h2>
              </div>
              <div className={styles.scrollable}>
                <div className="space-y-6">
                  <div>
                    <label className={styles.settingsLabel}>Theme Color</label>
                    <ColorPicker
                      colors={themeColors}
                      value={config.settings.theme_color}
                      onChange={(color) =>
                        setUserSettings({ ...config.settings, theme_color: color })
                      }
                    />
                  </div>

                  <div>
                    <label className={styles.settingsLabel}>Input Devices</label>
                    <div className="space-y-3">
                      <AudioInputTile
                        trackRef={localMicTrack || { source: Track.Source.Microphone, participant: null }}
                      />
                    </div>
                  </div>

                  {settingsTileContent}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}