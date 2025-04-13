import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { addNotification } from './notificationSlice';

// Async thunks
export const fetchJobs = createAsyncThunk(
    'jobs/fetchJobs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/jobs');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const searchJobs = createAsyncThunk(
    'jobs/searchJobs',
    async (searchQuery, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/jobs/search', { params: { q: searchQuery } });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchJobById = createAsyncThunk(
    'jobs/fetchJobById',
    async (jobId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/api/jobs/${jobId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const createJob = createAsyncThunk(
    'jobs/createJob',
    async (jobData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/jobs', jobData);
            toast.success('Job created successfully');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create job');
            return rejectWithValue(error.response.data);
        }
    }
);

export const applyToJob = createAsyncThunk(
    'jobs/applyToJob',
    async (jobId, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.post(`/api/jobs/${jobId}/apply`);
            
            // Add notification for the company
            dispatch(addNotification({
                type: 'job_application',
                message: `You have a new application for your job: ${response.data.job.title}`,
                sender: response.data.user._id,
                senderModel: 'User',
                receiver: response.data.job.company._id,
                receiverModel: 'Company',
                relatedId: response.data.job._id,
                isRead: false
            }));
            
            toast.success('Application submitted successfully');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply to job');
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchAppliedJobs = createAsyncThunk(
    'jobs/fetchAppliedJobs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/jobs/applied');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchJobApplications = createAsyncThunk(
    'jobs/fetchJobApplications',
    async (jobId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/api/jobs/${jobId}/applications`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateApplicationStatus = createAsyncThunk(
    'jobs/updateApplicationStatus',
    async ({ jobId, userId, status }, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.patch(`/api/jobs/${jobId}/applications/${userId}`, { status });
            
            // Add notification for the user
            dispatch(addNotification({
                type: 'job_application',
                message: `Your application for ${response.data.job.title} has been ${status}`,
                sender: response.data.company._id,
                senderModel: 'Company',
                receiver: userId,
                receiverModel: 'User',
                relatedId: jobId,
                isRead: false
            }));
            
            toast.success(`Application ${status} successfully`);
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${status} application`);
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchCompanyJobs = createAsyncThunk(
    'jobs/fetchCompanyJobs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/jobs/company');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteJob = createAsyncThunk(
    'jobs/deleteJob',
    async (jobId, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/jobs/${jobId}`);
            toast.success('Job deleted successfully');
            return jobId;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete job');
            return rejectWithValue(error.response.data);
        }
    }
);

const initialState = {
    jobs: [],
    currentJob: null,
    appliedJobs: [],
    companyJobs: [],
    applications: [],
    loading: false,
    error: null
};

const jobSlice = createSlice({
    name: 'jobs',
    initialState,
    reducers: {
        clearCurrentJob: (state) => {
            state.currentJob = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Jobs
            .addCase(fetchJobs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobs.fulfilled, (state, action) => {
                state.loading = false;
                state.jobs = action.payload;
            })
            .addCase(fetchJobs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch jobs';
            })
            // Search Jobs
            .addCase(searchJobs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchJobs.fulfilled, (state, action) => {
                state.loading = false;
                state.jobs = action.payload;
            })
            .addCase(searchJobs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to search jobs';
            })
            // Fetch Job by ID
            .addCase(fetchJobById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentJob = action.payload;
            })
            .addCase(fetchJobById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch job';
            })
            // Create Job
            .addCase(createJob.fulfilled, (state, action) => {
                state.jobs.unshift(action.payload);
            })
            // Apply to Job
            .addCase(applyToJob.fulfilled, (state, action) => {
                if (state.currentJob) {
                    state.currentJob.applications = action.payload.applications;
                }
            })
            // Fetch Applied Jobs
            .addCase(fetchAppliedJobs.fulfilled, (state, action) => {
                state.appliedJobs = action.payload;
            })
            // Fetch Job Applications
            .addCase(fetchJobApplications.fulfilled, (state, action) => {
                state.applications = action.payload;
            })
            // Update Application Status
            .addCase(updateApplicationStatus.fulfilled, (state, action) => {
                if (state.currentJob) {
                    state.currentJob.applications = action.payload.applications;
                }
                state.applications = state.applications.map(app => 
                    app.user._id === action.payload.user._id ? action.payload : app
                );
            })
            // Fetch Company Jobs
            .addCase(fetchCompanyJobs.fulfilled, (state, action) => {
                state.companyJobs = action.payload;
            })
            // Delete Job
            .addCase(deleteJob.fulfilled, (state, action) => {
                state.jobs = state.jobs.filter(job => job._id !== action.payload);
                state.companyJobs = state.companyJobs.filter(job => job._id !== action.payload);
                if (state.currentJob?._id === action.payload) {
                    state.currentJob = null;
                }
            });
    }
});

export const { clearCurrentJob } = jobSlice.actions;

// Selectors
export const selectJobs = (state) => state.jobs.jobs;
export const selectCurrentJob = (state) => state.jobs.currentJob;
export const selectAppliedJobs = (state) => state.jobs.appliedJobs;
export const selectCompanyJobs = (state) => state.jobs.companyJobs;
export const selectJobApplications = (state) => state.jobs.applications;
export const selectJobsLoading = (state) => state.jobs.loading;
export const selectJobsError = (state) => state.jobs.error;

export default jobSlice.reducer; 