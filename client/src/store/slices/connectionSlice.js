import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { addNotification } from './notificationSlice';

// Async thunks
export const fetchConnections = createAsyncThunk(
    'connections/fetchConnections',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/connections');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const connectWithUser = createAsyncThunk(
    'connections/connect',
    async (receiverId, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post('/api/connections/connect', { receiverId });
            
            // Add notification for the receiver
            dispatch(addNotification({
                type: 'connection_request',
                message: `You have a new connection request from ${response.data.requester.username}`,
                sender: response.data.requester._id,
                senderModel: response.data.requester.role === 'company' ? 'Company' : 'User',
                receiver: response.data.receiver._id,
                receiverModel: response.data.receiver.role === 'company' ? 'Company' : 'User',
                relatedId: response.data.connection._id,
                isRead: false
            }));
            
            toast.success('Connection request sent successfully');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send connection request');
            return rejectWithValue(error.response.data);
        }
    }
);

export const acceptConnection = createAsyncThunk(
    'connections/accept',
    async (connectionId, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.put(`/api/connections/accept/${connectionId}`);
            const { connection, requester } = response.data;
            
            // Add notification for the requester
            dispatch(addNotification({
                type: 'connection_request',
                message: `${connection.receiver.username} accepted your connection request`,
                sender: connection.receiver._id,
                senderModel: connection.receiver.role === 'company' ? 'Company' : 'User',
                receiver: requester._id,
                receiverModel: requester.role === 'company' ? 'Company' : 'User',
                relatedId: connection._id,
                isRead: false
            }));
            
            toast.success('Connection request accepted');
            return connection;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept connection request');
            return rejectWithValue(error.response.data);
        }
    }
);

export const rejectConnection = createAsyncThunk(
    'connections/reject',
    async (connectionId, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.put(`/api/connections/reject/${connectionId}`);
            const { connection, requester } = response.data;
            
            // Add notification for the requester
            dispatch(addNotification({
                type: 'connection_request',
                message: `${connection.receiver.username} rejected your connection request`,
                sender: connection.receiver._id,
                senderModel: connection.receiver.role === 'company' ? 'Company' : 'User',
                receiver: requester._id,
                receiverModel: requester.role === 'company' ? 'Company' : 'User',
                relatedId: connection._id,
                isRead: false
            }));
            
            toast.success('Connection request rejected');
            return connection;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject connection request');
            return rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    connections: [],
    connectionRequests: [],
    loading: false,
    error: null
};

const connectionSlice = createSlice({
    name: 'connections',
    initialState,
    reducers: {
        clearConnections: (state) => {
            state.connections = [];
            state.connectionRequests = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Connections
            .addCase(fetchConnections.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConnections.fulfilled, (state, action) => {
                state.loading = false;
                state.connections = action.payload.connections;
                state.connectionRequests = action.payload.requests;
            })
            .addCase(fetchConnections.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch connections';
            })
            // Accept Connection
            .addCase(acceptConnection.fulfilled, (state, action) => {
                state.connectionRequests = state.connectionRequests.filter(
                    request => request._id !== action.payload._id
                );
                state.connections.push(action.payload);
            })
            // Reject Connection
            .addCase(rejectConnection.fulfilled, (state, action) => {
                state.connectionRequests = state.connectionRequests.filter(
                    request => request._id !== action.payload._id
                );
            });
    }
});

export const { clearConnections } = connectionSlice.actions;

// Selectors
export const selectConnections = (state) => state.connections.connections;
export const selectConnectionRequests = (state) => state.connections.connectionRequests;
export const selectConnectionsLoading = (state) => state.connections.loading;
export const selectConnectionsError = (state) => state.connections.error;

export default connectionSlice.reducer; 