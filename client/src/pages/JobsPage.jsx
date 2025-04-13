import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectUser, selectCompany } from '../store/slices/authSlice';
import { fetchJobs, selectJobs, selectJobsLoading, selectJobsError, selectHasMore } from '../store/slices/jobSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const JobsPage = () => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const user = useSelector(selectUser);
  const company = useSelector(selectCompany);
  const isCompany = !!company;
  const jobs = useSelector(selectJobs);
  const loading = useSelector(selectJobsLoading);
  const error = useSelector(selectJobsError);
  const hasMore = useSelector(selectHasMore);

  useEffect(() => {
    dispatch(fetchJobs({ page, isCompany }));
  }, [dispatch, page, isCompany]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && page === 1) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          {isCompany ? 'Posted Jobs' : 'Available Jobs'}
        </h1>
        {isCompany && (
          <Link
            to="/upload-job"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Post New Job
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center text-gray-400 p-8">
            {isCompany ? 'No jobs posted yet' : 'No jobs available at the moment'}
          </div>
        ) : (
          jobs.map((job) => (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              className="block bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-white">{job.title}</h2>
                  <p className="text-gray-400 mt-1">{job.companyName}</p>
                </div>
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  {job.type}
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-gray-400">
                <div>
                  <p className="text-sm">Location</p>
                  <p className="text-white">{job.location}</p>
                </div>
                <div>
                  <p className="text-sm">Salary</p>
                  <p className="text-white">{job.salary}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-400">Posted {new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default JobsPage; 