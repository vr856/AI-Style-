import { motion, AnimatePresence, Variants } from "framer-motion";
import Head from "next/head";
import { useState } from "react";
import { LiveKitRoom, RoomAudioRenderer, StartAudio } from "@livekit/components-react";
import Playground from "@/components/playground/Playground";
import { useConnection } from "@/hooks/useConnection";

const themeColors = ["cyan", "green", "amber", "blue", "violet", "rose", "pink", "teal"];

function ConnectionWrapper() {
  const { wsUrl, token, connect, disconnect } = useConnection();
  const [showPlayground, setShowPlayground] = useState(false);

  const handleConnect = async (shouldConnect: boolean) => {
    if (shouldConnect) {
      await connect("env");
    } else {
      await disconnect();
    }
  };

  return (
    <>
      <motion.button
        className="px-10 py-5 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md text-white rounded-full font-bold text-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10"
        whileHover={{ 
          scale: 1.05, 
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.15), rgba(255,255,255,0.1))"
        }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setShowPlayground(true);
          handleConnect(true);
        }}
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/90">
          Get Your Style Consultation
        </span>
      </motion.button>

      <AnimatePresence>
        {showPlayground && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-filter backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-transparent w-full max-w-5xl h-[90vh] overflow-hidden rounded-2xl shadow-2xl relative z-50"
            >
              <LiveKitRoom
                serverUrl={wsUrl}
                token={token}
                connect={true}
                className="w-full h-full"
              >
                <Playground
                  themeColors={themeColors}
                  onConnect={handleConnect}
                  onClose={() => {
                    setShowPlayground(false);
                    handleConnect(false);
                  }}
                />
                <RoomAudioRenderer />
                <StartAudio label="Click to enable audio playback" />
              </LiveKitRoom>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>AI Style Consultant | Your Personal Fashion Assistant</title>
        <meta name="description" content="Get personalized fashion advice and style recommendations from our AI-powered style consultant" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.main 
        className="flex flex-col items-center justify-center min-h-screen text-white overflow-hidden relative"
        animate={{
          background: [
            "linear-gradient(45deg, #000428 0%, #004e92 100%)",
            "linear-gradient(45deg, #1a2a6c 0%, #b21f1f 51%, #fdbb2d 100%)",
            "linear-gradient(45deg, #0f0c29 0%, #302b63 51%, #24243e 100%)",
            "linear-gradient(45deg, #000428 0%, #004e92 100%)"
          ]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse" as const
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-white/10 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Floating design elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 right-20 w-32 h-32 border border-white/20 rounded-full"
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: {
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              },
              scale: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-24 h-24 border border-white/20 rounded-full"
            animate={{
              rotate: -360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: {
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              },
              scale: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center relative z-10 px-4"
        >
          <motion.div
            className="inline-block"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <h1 className="text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/80 tracking-tight">
              Your AI Style Consultant
            </h1>
          </motion.div>
          <p className="text-xl mb-16 max-w-2xl mx-auto text-white/90 leading-relaxed font-light">
            Discover your perfect style with our AI-powered fashion assistant. 
            Get personalized recommendations, outfit ideas, and style tips tailored just for you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10"
        >
          <ConnectionWrapper />
        </motion.div>

        {/* Features section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute bottom-10 left-0 right-0 flex justify-center gap-8 px-4 z-[5]"
        >
          <motion.div 
            className="flex gap-12 backdrop-blur-lg bg-white/5 p-8 rounded-3xl border border-white/10"
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="text-center px-8"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl font-bold mb-3">Smart</div>
              <div className="text-sm text-white/80 font-light">Style Analysis</div>
            </motion.div>
            <motion.div 
              className="text-center px-8 border-x border-white/10"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl font-bold mb-3">Personal</div>
              <div className="text-sm text-white/80 font-light">Fashion Advice</div>
            </motion.div>
            <motion.div 
              className="text-center px-8"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl font-bold mb-3">Trendy</div>
              <div className="text-sm text-white/80 font-light">Recommendations</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.main>
    </>
  );
}