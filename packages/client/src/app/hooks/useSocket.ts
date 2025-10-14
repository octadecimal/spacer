import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketEvents } from './types';

export function useSocket() {
  const [socket, setSocket] = useState<Socket<SocketEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, isConnected };
}
