import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  applyToJob,
  fetchJobApplications,
  updateApplicationStatus,
  selectCurrentJob,
  selectJobApplications
} from '../../store/slices/jobSlice';
import { selectUser } from '../../store/slices/authSlice';

const JobApplication = ({ jobId }) => {
  const dispatch = useDispatch();
  const currentJob = useSelector(selectCurrentJob);
  const applications = useSelector(selectJobApplications);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (currentJob?.company?._id === user?._id) {
      dispatch(fetchJobApplications(jobId));
    }
  }, [dispatch, jobId, currentJob, user]);

  const handleApply = async () => {
    await dispatch(applyToJob(jobId));
  };

  const handleUpdateStatus = async (userId, status) => {
    await dispatch(updateApplicationStatus({ jobId, userId, status }));
  };

  // Check if user has already applied
  const hasApplied = currentJob?.applications?.some(
    app => app.user._id === user?._id
  );

  // Check if user is the job owner
  const isJobOwner = currentJob?.company?._id === user?._id;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {!isJobOwner && !hasApplied && (
        <button
          onClick={handleApply}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply Now
        </button>
      )}

      {hasApplied && (
        <div className="text-center text-green-500">
          You have already applied to this job
        </div>
      )}

      {isJobOwner && applications.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-white mb-4">Applications</h3>
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application._id}
                className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={application.user.profilePicture || '/default-avatar.png'}
                    alt={application.user.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <Link
                      to={`/profile/${application.user.username}`}
                      className="text-white hover:text-blue-400"
                    >
                      {application.user.username}
                    </Link>
                    <p className="text-gray-400 text-sm">
                      Status: {application.status}
                    </p>
                  </div>
                </div>
                {application.status === 'pending' && (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(application.user._id, 'accepted')}
                      className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(application.user._id, 'rejected')}
                      className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplication; 