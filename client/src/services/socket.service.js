import { io } from 'socket.io-client';
import { store } from '../store';
import {
    addNotification,
    updateConnectionStatus,
    updateApplicationStatus,
    updateVoteCount
} from '../store/slices/notificationSlice';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        this.socket = io(process.env.VITE_API_URL, {
            withCredentials: true
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
            
            // Send user ID to server
            const { user } = store.getState().auth;
            if (user) {
                this.socket.emit('userConnected', user._id);
            }
        });

        // Handle connection request
        this.socket.on('connectionRequest', (data) => {
            store.dispatch(addNotification(data.notification));
        });

        // Handle connection status update
        this.socket.on('connectionStatus', (data) => {
            store.dispatch(updateConnectionStatus(data.connection));
            store.dispatch(addNotification(data.notification));
        });

        // Handle job application
        this.socket.on('jobApplication', (data) => {
            store.dispatch(addNotification(data.notification));
        });

        // Handle application status update
        this.socket.on('applicationStatus', (data) => {
            store.dispatch(updateApplicationStatus(data));
            store.dispatch(addNotification(data.notification));
        });

        // Handle vote update
        this.socket.on('voteUpdate', (data) => {
            store.dispatch(updateVoteCount(data));
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export default new SocketService(); 