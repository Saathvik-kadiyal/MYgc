import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchConnections,
    removeConnection,
    selectConnections,
    selectConnectionLoading,
    selectConnectionError
} from '../../store/slices/connectionSlice';
import { Link } from 'react-router-dom';

const Connections = () => {
    const dispatch = useDispatch();
    const connections = useSelector(selectConnections);
    const loading = useSelector(selectConnectionLoading);
    const error = useSelector(selectConnectionError);

    useEffect(() => {
        dispatch(fetchConnections());
    }, [dispatch]);

    const handleRemove = (username) => {
        dispatch(removeConnection(username));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    if (connections.length === 0) {
        return <div className="text-center text-gray-500">No connections yet</div>;
    }

    return (
        <div className="space-y-4">
            {connections.map((connection) => (
                <div
                    key={connection._id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
                >
                    <div className="flex items-center space-x-4">
                        <img
                            src={connection.profilePicture || '/default-avatar.png'}
                            alt={connection.username}
                            className="w-12 h-12 rounded-full"
                        />
                        <div>
                            <Link
                                to={`/${connection.username}`}
                                className="text-lg font-semibold hover:text-blue-500"
                            >
                                {connection.username}
                            </Link>
                            {connection.bio && (
                                <p className="text-gray-600 dark:text-gray-400">{connection.bio}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => handleRemove(connection.username)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Remove
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Connections; 