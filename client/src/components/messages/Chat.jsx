import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchMessages, sendMessage, markMessageAsRead, deleteMessage, initSocket, joinConversation, leaveConversation, addMessage } from '../../store/slices/messageSlice';
import { formatDistanceToNow } from 'date-fns';

const Chat = () => {
    const dispatch = useDispatch();
    const { conversationId } = useParams();
    const { messages, loading, error } = useSelector((state) => state.message);
    const { user } = useSelector((state) => state.auth);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (conversationId) {
            dispatch(fetchMessages({ conversationId, otherUserId: user._id }));
            socketRef.current = initSocket();
            dispatch(joinConversation(conversationId));

            // Set up socket listeners
            socketRef.current.on('newMessage', (message) => {
                dispatch(addMessage(message));
            });
        }

        return () => {
            if (socketRef.current) {
                dispatch(leaveConversation(conversationId));
            }
        };
    }, [conversationId, dispatch, user._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            conversationId,
            content: newMessage,
            receiverId: user._id
        };

        try {
            await dispatch(sendMessage(messageData)).unwrap();
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleMarkAsRead = async (messageId) => {
        try {
            await dispatch(markMessageAsRead(messageId)).unwrap();
        } catch (error) {
            console.error('Failed to mark message as read:', error);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await dispatch(deleteMessage(messageId)).unwrap();
            } catch (error) {
                console.error('Failed to delete message:', error);
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message._id}
                        className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender._id === user._id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-900'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <img
                                    src={message.sender.avatar || '/default-avatar.png'}
                                    alt={message.sender.name}
                                    className="w-6 h-6 rounded-full"
                                />
                                <span className="font-medium">{message.sender.name}</span>
                            </div>
                            <p className="mt-1">{message.content}</p>
                            <div className="flex items-center justify-between mt-2 text-xs">
                                <span>
                                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                </span>
                                {message.sender._id === user._id && (
                                    <button
                                        onClick={() => handleDeleteMessage(message._id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex space-x-4">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chat; 