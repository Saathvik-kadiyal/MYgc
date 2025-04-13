import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchJobById,
  selectCurrentJob,
  selectJobsLoading,
  selectJobsError
} from '../store/slices/jobSlice';
import JobApplication from '../components/jobs/JobApplication';
import { toast } from 'react-toastify';

const JobDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const job = useSelector(selectCurrentJob);
  const loading = useSelector(selectJobsLoading);
  const error = useSelector(selectJobsError);

  useEffect(() => {
    dispatch(fetchJobById(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    toast.error(error);
    return null;
  }

  if (!job) {
    return (
      <div className="text-center text-white mt-8">
        Job not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={job.company.logo || '/default-company.png'}
            alt={job.company.name}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            <p className="text-gray-400">{job.company.name}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Description</h2>
            <p className="text-gray-300">{job.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Budget</h2>
            <p className="text-gray-300">${job.budget}</p>
          </div>
        </div>
      </div>

      <JobApplication jobId={id} />
    </div>
  );
};

export default JobDetailPage; 