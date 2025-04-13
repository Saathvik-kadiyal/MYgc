import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectCompany } from '../store/slices/authSlice';
import {
  fetchJobDetails,
  applyToJob,
  fetchJobApplications,
  selectCurrentJob,
  selectJobApplications,
  selectJobsLoading,
  selectJobsError,
  selectApplying,
  selectApplicationSuccess,
  resetApplicationStatus
} from '../store/slices/jobSlice';

const JobDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const company = useSelector(selectCompany);
  const isCompany = !!company;
  const job = useSelector(selectCurrentJob);
  const loading = useSelector(selectJobsLoading);
  const error = useSelector(selectJobsError);
  const applying = useSelector(selectApplying);
  const applicationSuccess = useSelector(selectApplicationSuccess);
  const applications = useSelector(selectJobApplications);

  useEffect(() => {
    dispatch(fetchJobDetails(id));
    if (isCompany) {
      dispatch(fetchJobApplications(id));
    }
    return () => {
      dispatch(resetApplicationStatus());
    };
  }, [dispatch, id, isCompany]);

  const handleApply = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    dispatch(applyToJob(id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center text-gray-400 p-8">
        Job not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            <p className="text-gray-400 mt-1">{job.companyName}</p>
            <div className="flex items-center mt-4 text-sm text-gray-400">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
              <span className="mx-2">•</span>
              <span>{job.type}</span>
              <span className="mx-2">•</span>
              <span className="text-green-400">{job.salary}</span>
            </div>
          </div>
          {!isCompany && !applicationSuccess && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {applying ? 'Applying...' : 'Apply Now'}
            </button>
          )}
          {applicationSuccess && (
            <div className="text-green-400 font-medium">
              Application submitted successfully!
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Job Description</h2>
            <p className="text-gray-300 mt-2 whitespace-pre-line">{job.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">Requirements</h2>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              {job.requirements?.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">Benefits</h2>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
              {job.benefits?.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-400">
          Posted on {new Date(job.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex justify-between">
        <Link
          to="/jobs"
          className="text-blue-400 hover:text-blue-300"
        >
          ← Back to Jobs
        </Link>
        {isCompany && job.companyId === company._id && (
          <Link
            to={`/jobs/${id}/applications`}
            className="text-blue-400 hover:text-blue-300"
          >
            View Applications ({applications.length})
          </Link>
        )}
      </div>
    </div>
  );
};

export default JobDetailsPage; 