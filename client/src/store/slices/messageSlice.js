import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { io } from 'socket.io-client';

let socket = null;

// Initialize socket connection
export const initSocket = () => {
    if (!socket) {
        socket = io(api.defaults.baseURL, {
            withCredentials: true
        });
    }
    return socket;
};

// Async thunks
export const fetchConversations = createAsyncThunk(
    'message/fetchConversations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/messages/conversations');
            return response.data.conversations;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
        }
    }
);

export const fetchMessages = createAsyncThunk(
    'message/fetchMessages',
    async ({ conversationId, otherUserId }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/messages/${conversationId}?otherUserId=${otherUserId}`);
            return response.data.messages;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
        }
    }
);

export const sendMessage = createAsyncThunk(
    'message/sendMessage',
    async ({ conversationId, content, receiverId }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/messages/${conversationId}`, {
                content,
                receiverId
            });
            // Emit socket event for real-time updates
            if (socket) {
                socket.emit('sendMessage', response.data.message);
            }
            return response.data.message;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send message');
        }
    }
);

export const markMessageAsRead = createAsyncThunk(
    'message/markMessageAsRead',
    async (messageId, { rejectWithValue }) => {
        try {
            const response = await api.put(`/messages/${messageId}/read`);
            return response.data.message;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to mark message as read');
        }
    }
);

export const deleteMessage = createAsyncThunk(
    'message/deleteMessage',
    async (messageId, { rejectWithValue }) => {
        try {
            await api.delete(`/messages/${messageId}`);
            return messageId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete message');
        }
    }
);

const initialState = {
    conversations: [],
    currentConversation: null,
    messages: [],
    loading: false,
    error: null,
    unreadCount: 0
};

const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        clearMessages: (state) => {
            state.messages = [];
            state.currentConversation = null;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        joinConversation: (state, action) => {
            if (socket) {
                socket.emit('joinConversation', action.payload);
            }
        },
        leaveConversation: (state, action) => {
            if (socket) {
                socket.emit('leaveConversation', action.payload);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Conversations
            .addCase(fetchConversations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.loading = false;
                state.conversations = action.payload;
                state.unreadCount = action.payload.reduce((count, conv) => count + conv.unreadCount, 0);
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Fetch Messages
            .addCase(fetchMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.messages = action.payload;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Send Message
            .addCase(sendMessage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.loading = false;
                state.messages.push(action.payload);
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Mark Message as Read
            .addCase(markMessageAsRead.fulfilled, (state, action) => {
                const message = state.messages.find(m => m._id === action.payload._id);
                if (message) {
                    message.isRead = true;
                }
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            })
            // Delete Message
            .addCase(deleteMessage.fulfilled, (state, action) => {
                state.messages = state.messages.filter(m => m._id !== action.payload);
            });
    }
});

export const { clearMessages, addMessage, joinConversation, leaveConversation } = messageSlice.actions;
export default messageSlice.reducer; 