import { motion } from "framer-motion";
import { ReactNode } from "react";

export interface PlaygroundTileProps {
  children: ReactNode;
  className?: string;
  childrenClassName?: string;
}

export function PlaygroundTile({ children, className = "", childrenClassName = "" }: PlaygroundTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden ${className}`}
    >
      <div className={childrenClassName}>
        {children}
      </div>
    </motion.div>
  );
}

export interface PlaygroundTabbedTileProps extends PlaygroundTileProps {
  tabs: PlaygroundTab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export interface PlaygroundTab {
  id: string;
  label: string;
  icon?: ReactNode;
}

export function PlaygroundTabbedTile({
  children,
  className = "",
  tabs,
  activeTab,
  onTabChange,
}: PlaygroundTabbedTileProps) {
  return (
    <PlaygroundTile className={`flex flex-col ${className}`}>
      <div className="flex gap-1 p-2 bg-black/20">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-white/10 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.icon}
            {tab.label}
          </motion.button>
        ))}
      </div>
      <div className="flex-1 p-4">{children}</div>
    </PlaygroundTile>
  );
}
