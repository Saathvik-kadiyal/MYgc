import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchConversations } from '../../store/slices/messageSlice';
import { formatDistanceToNow } from 'date-fns';

const ConversationList = () => {
    const dispatch = useDispatch();
    const { conversations, loading, error } = useSelector((state) => state.message);

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    if (loading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (
        <div className="space-y-4">
            {conversations.length === 0 ? (
                <div className="text-center text-gray-500 p-4">
                    No conversations yet
                </div>
            ) : (
                conversations.map((conversation) => (
                    <Link
                        key={conversation._id}
                        to={`/messages/${conversation._id}`}
                        className="block p-4 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <img
                                        src={conversation.lastMessage.sender.avatar || '/default-avatar.png'}
                                        alt={conversation.lastMessage.sender.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    {conversation.unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {conversation.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">
                                        {conversation.lastMessage.sender.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 truncate max-w-xs">
                                        {conversation.lastMessage.content}
                                    </p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                            </div>
                        </div>
                    </Link>
                ))
            )}
        </div>
    );
};

export default ConversationList; 