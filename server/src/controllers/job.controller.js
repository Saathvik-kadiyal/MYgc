const Job = require("../models/job.model.js");
const Company = require("../models/company.model.js");
const User = require("../models/user.model.js");
const Notification = require("../models/notification.model.js");

// POST a new job (Company only)
exports.postJob = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "Only companies can post jobs" });
    }

    const companyId = req.user.id;
    const { title, description, requiredSkills, budget } = req.body;

    const job = await Job.create({
      company: companyId,
      title,
      description,
      requiredSkills,
      budget
    });

    await Company.findByIdAndUpdate(companyId, {
      $push: { jobPostings: job._id }
    });

    return res.status(201).json({ message: "Job posted successfully", job });
  } catch (err) {
    console.error("postJob error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Search jobs
exports.searchJobs = async (req, res) => {
  try {
    if (req.user.role === "company") {
      return res.status(403).json({ message: "Companies are not allowed to search job listings" });
    }

    const { query, skills } = req.query;
    let searchQuery = {};

    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      searchQuery.requiredSkills = { $in: skillsArray };
    }

    const jobs = await Job.find(searchQuery)
      .populate("company", "username email profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({ jobs });
  } catch (err) {
    console.error("searchJobs error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /jobs/company (Company only)
exports.getCompanyJobs = async (req, res) => {
    try {
      if (req.user.role !== "company") {
        return res.status(403).json({ message: "Only companies can view their job posts" });
      }
  
      const companyId = req.user.id;
  
      const jobs = await Job.find({ company: companyId });
  
      return res.status(200).json({ jobs });
    } catch (err) {
      console.error("getCompanyJobs error:", err);
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  

// Get all active job listings
exports.getAllJobs = async (req, res) => {
  try {

    if (req.user.role === "company") {
        return res.status(403).json({ message: "Companies are not allowed to view job listings" });
      }

    const jobs = await Job.find().populate("company", "username email profilePicture");
    return res.status(200).json({ jobs });
  } catch (error) {
    console.error("getAllJobs error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single job post by ID
exports.getJobById = async (req, res) => {
  try {

    if (req.user.role === "company") {
        return res.status(403).json({ message: "Companies are not allowed to view job listings" });
      }

    const { jobId } = req.params;

    const job = await Job.findById(jobId)
      .populate("company", "username email profilePicture")
      .populate("applications.user", "username email profilePicture");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ job });
  } catch (err) {
    console.error("getJobById error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Apply to a job (User only)
exports.applyToJob = async (req, res) => {
  try {
    if (req.user.role === "company") {
      return res.status(403).json({ message: "Companies cannot apply to jobs" });
    }

    const jobId = req.params.jobId;
    const userId = req.user.id;

    const job = await Job.findById(jobId).populate('company', 'username');
    if (!job) return res.status(404).json({ message: "Job not found" });

    const alreadyApplied = job.applications.some(app => app.user.toString() === userId);
    if (alreadyApplied) {
      return res.status(400).json({ message: "You already applied to this job" });
    }

    job.applications.push({ user: userId });
    await job.save();

    // Create notification for the company
    await Notification.create({
      type: 'job_application',
      message: `New application received for ${job.title}`,
      sender: userId,
      senderModel: 'User',
      receiver: job.company._id,
      receiverModel: 'Company',
      relatedId: jobId,
      status: 'pending'
    });

    return res.status(200).json({ message: "Applied successfully" });
  } catch (err) {
    console.error("applyToJob error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all applications for a job (Company only)
exports.getJobApplications = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "Only companies can view job applications" });
    }

    const jobId = req.params.jobId;
    const companyId = req.user.id;

    const job = await Job.findOne({ _id: jobId, company: companyId })
      .populate("applications.user", "username email profilePicture");

    if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });

    return res.status(200).json({ applications: job.applications });
  } catch (err) {
    console.error("getJobApplications error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user's applied jobs
exports.getAppliedJobs = async (req, res) => {
  try {
    if (req.user.role === "company") {
      return res.status(403).json({ message: "Companies cannot view applied jobs" });
    }

    const userId = req.user.id;
    const jobs = await Job.find({
      'applications.user': userId
    })
    .populate('company', 'username email profilePicture')
    .select('title description budget applications company createdAt')
    .sort({ 'applications.createdAt': -1 });

    // Format applications for response
    const applications = jobs.map(job => {
      const application = job.applications.find(app => app.user.toString() === userId);
      return {
        jobId: job._id,
        jobTitle: job.title,
        company: job.company,
        status: application.status,
        appliedAt: application.createdAt,
        budget: job.budget
      };
    });

    return res.status(200).json({ applications });
  } catch (err) {
    console.error("getAppliedJobs error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update application status (accept/reject)
exports.updateApplicationStatus = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "Only companies can update application status" });
    }

    const { jobId, userId } = req.params;
    const { status } = req.body;
    const companyId = req.user.id;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const job = await Job.findOne({ _id: jobId, company: companyId })
      .populate('company', 'username');
    
    if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });

    const application = job.applications.find(app => app.user.toString() === userId);
    if (!application) return res.status(404).json({ message: "Application not found" });

    application.status = status;
    await job.save();

    // Create notification for the user
    await Notification.create({
      type: 'job_application',
      message: `Your application for ${job.title} at ${job.company.username} has been ${status}`,
      sender: companyId,
      senderModel: 'Company',
      receiver: userId,
      receiverModel: 'User',
      relatedId: jobId,
      status: 'pending'
    });

    return res.status(200).json({ message: `Application ${status}`, application });
  } catch (err) {
    console.error("updateApplicationStatus error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /jobs/:jobId (Company only)
exports.deleteJob = async (req, res) => {
    try {
      if (req.user.role !== "company") {
        return res.status(403).json({ message: "Only companies can delete jobs" });
      }
  
      const companyId = req.user.id;
      const jobId = req.params.jobId;
  
      const job = await Job.findOneAndDelete({ _id: jobId, company: companyId });
      if (!job) return res.status(404).json({ message: "Job not found or unauthorized" });
  
      await Company.findByIdAndUpdate(companyId, { $pull: { jobPostings: jobId } });
  
      return res.status(200).json({ message: "Job deleted successfully" });
    } catch (err) {
      console.error("deleteJob error:", err);
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  