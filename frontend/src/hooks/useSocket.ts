import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

let globalSocket: Socket | null = null;

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000
      });
    }

    socketRef.current = globalSocket;

    return () => {
      // Keep persistent connection across re-renders
    };
  }, []);

  const joinOrder = (orderId: string) => {
    if (globalSocket && orderId) {
      globalSocket.emit('join_order', orderId);
    }
  };

  const joinKDS = () => {
    if (globalSocket) {
      globalSocket.emit('join_kds');
    }
  };

  const joinCourier = (courierId: string) => {
    if (globalSocket && courierId) {
      globalSocket.emit('join_courier', courierId);
    }
  };

  const sendCourierLocation = (data: {
    orderId: string;
    courierId: string;
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
  }) => {
    if (globalSocket) {
      globalSocket.emit('courier_location_update', data);
    }
  };

  return {
    socket: globalSocket,
    joinOrder,
    joinKDS,
    joinCourier,
    sendCourierLocation
  };
};
