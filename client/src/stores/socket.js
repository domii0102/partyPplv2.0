import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import { SERVER_BASE_URL } from '../config/env';
import { useUserStore } from './user';

export const useSocketStore = defineStore('socket', {
    state: () => ({ socket: null }),
    
    actions: {
        connect() {
            if (this.socket?.connected) {
                console.log('Socket already connected');
                return;
            }

            const userStore = useUserStore();
            console.log('Connecting socket with token:', userStore.token ? 'EXISTS' : 'NULL');
            this.socket = io(SERVER_BASE_URL, {
                withCredentials: true
            });

            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket.id);
            });

            this.socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            this.socket.on('notification', (notification) => {
                this.onNotification?.(notification);
            });
        },

        disconnect() {
            this.socket?.disconnect();
            this.socket = null;
        },

        joinEvent(eventId) {
            this.socket?.emit('join_event', parseInt(eventId));
        },

        leaveEvent(eventId) {
            this.socket?.emit('leave_event', parseInt(eventId));
        },

        onNotificationReceived(callback) {
            this.onNotification = callback;
        }
    }
});