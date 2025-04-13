import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchConnectionRequests,
    acceptConnectionRequest,
    rejectConnectionRequest,
    selectConnectionRequests,
    selectConnectionLoading,
    selectConnectionError
} from '../../store/slices/connectionSlice';
import { Link } from 'react-router-dom';

const ConnectionRequests = () => {
    const dispatch = useDispatch();
    const requests = useSelector(selectConnectionRequests);
    const loading = useSelector(selectConnectionLoading);
    const error = useSelector(selectConnectionError);

    useEffect(() => {
        dispatch(fetchConnectionRequests());
    }, [dispatch]);

    const handleAccept = (username) => {
        dispatch(acceptConnectionRequest(username));
    };

    const handleReject = (username) => {
        dispatch(rejectConnectionRequest(username));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    if (requests.length === 0) {
        return <div className="text-center text-gray-500">No connection requests</div>;
    }

    return (
        <div className="space-y-4">
            {requests.map((request) => (
                <div
                    key={request._id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
                >
                    <div className="flex items-center space-x-4">
                        <img
                            src={request.profilePicture || '/default-avatar.png'}
                            alt={request.username}
                            className="w-12 h-12 rounded-full"
                        />
                        <div>
                            <Link
                                to={`/${request.username}`}
                                className="text-lg font-semibold hover:text-blue-500"
                            >
                                {request.username}
                            </Link>
                            {request.bio && (
                                <p className="text-gray-600 dark:text-gray-400">{request.bio}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleAccept(request.username)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => handleReject(request.username)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ConnectionRequests; 