import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ConversationList from '../components/messages/ConversationList';
import Chat from '../components/messages/Chat';

const MessagesPage = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Messages</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <ConversationList />
                </div>
                <div className="lg:col-span-2">
                    <Routes>
                        <Route path=":conversationId" element={<Chat />} />
                        <Route
                            path="*"
                            element={
                                <div className="flex items-center justify-center h-64 text-gray-500">
                                    Select a conversation to start messaging
                                </div>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default MessagesPage; 