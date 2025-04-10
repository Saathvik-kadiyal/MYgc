const Company = require('../models/company.model');
const Job = require('../models/job.model');

exports.createJobPost = async (req, res) => {
    try {
        const company = await Company.findById(req.company.id);
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        const jobPost = new Job({
            ...req.body,
            company: req.company.id
        });

        await jobPost.save();

        // Add job post to company's jobPostings array
        company.jobPostings.push(jobPost._id);
        await company.save();

        res.status(201).json({
            success: true,
            message: "Job post created successfully",
            jobPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating job post",
            error: error.message
        });
    }
};

exports.getCompanyJobPosts = async (req, res) => {
    try {
        const company = await Company.findById(req.company.id)
            .populate('jobPostings')
            .select('jobPostings');

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        res.status(200).json({
            success: true,
            jobPosts: company.jobPostings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching job posts",
            error: error.message
        });
    }
};
