import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  connectWithUser,
  acceptConnection,
  rejectConnection,
  selectConnections,
  selectConnectionRequests
} from '../../store/slices/connectionSlice';
import { selectUser } from '../../store/slices/authSlice';

const ConnectionButton = ({ targetId, targetUsername }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const connections = useSelector(selectConnections);
  const connectionRequests = useSelector(selectConnectionRequests);
  const [loading, setLoading] = useState(false);

  // Check if already connected
  const isConnected = connections.some(
    connection => connection.requester._id === targetId || connection.receiver._id === targetId
  );

  // Check if there's a pending request
  const pendingRequest = connectionRequests.find(
    request => (request.requester._id === targetId || request.receiver._id === targetId) && request.status === 'pending'
  );

  const handleConnect = async () => {
    setLoading(true);
    try {
      await dispatch(connectWithUser(targetId));
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await dispatch(acceptConnection(pendingRequest._id));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await dispatch(rejectConnection(pendingRequest._id));
    } finally {
      setLoading(false);
    }
  };

  if (user?._id === targetId) {
    return null;
  }

  if (isConnected) {
    return (
      <button
        className="bg-gray-700 text-white px-4 py-2 rounded-lg"
        disabled
      >
        Connected
      </button>
    );
  }

  if (pendingRequest) {
    if (pendingRequest.receiver._id === user?._id) {
      return (
        <div className="space-x-2">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            {loading ? 'Accepting...' : 'Accept'}
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            {loading ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      );
    } else {
      return (
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded-lg"
          disabled
        >
          Request Sent
        </button>
      );
    }
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
    >
      {loading ? 'Connecting...' : 'Connect'}
    </button>
  );
};

export default ConnectionButton; 