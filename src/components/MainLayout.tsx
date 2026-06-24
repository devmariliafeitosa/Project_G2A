import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface MainLayoutProps {
  sidebar: React.ReactNode;
  animationKey: string;
  children: React.ReactNode;
}

const MainLayout = ({ sidebar, animationKey, children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      {sidebar}
      <main className="flex-1 ml-64 p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={animationKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MainLayout;
