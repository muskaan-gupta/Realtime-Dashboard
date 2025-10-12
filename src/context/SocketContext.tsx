'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSocket } from '@/hooks/useSocket';

type UseSocketReturn = ReturnType<typeof useSocket>;

const SocketContext = createContext<UseSocketReturn | undefined>(undefined);

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}

export { useSocketContext as useSocket };

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const socketData = useSocket();

  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
}