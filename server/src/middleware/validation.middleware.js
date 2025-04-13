const { body, param, query } = require('express-validator');
const { validate } = require('../utils/validator.js');

// Common validation rules
const commonRules = {
    id: param('id').isMongoId().withMessage('Invalid ID format'),
    page: query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    limit: query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    search: query('search').optional().isString().trim().notEmpty().withMessage('Search query cannot be empty')
};

// Profile validation rules
const profileRules = {
    updateProfile: [
        body('username').optional().isString().trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
        body('email').optional().isEmail().withMessage('Invalid email format'),
        body('bio').optional().isString().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
        body('location').optional().isString().trim().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
        body('website').optional().isURL().withMessage('Invalid website URL'),
        body('skills').optional().isArray().withMessage('Skills must be an array'),
        body('skills.*').optional().isString().withMessage('Each skill must be a string')
    ]
};

// Job validation rules
const jobRules = {
    createJob: [
        body('title').isString().trim().notEmpty().withMessage('Title is required'),
        body('description').isString().trim().notEmpty().withMessage('Description is required'),
        body('requirements').isArray().withMessage('Requirements must be an array'),
        body('requirements.*').isString().withMessage('Each requirement must be a string'),
        body('location').isString().trim().notEmpty().withMessage('Location is required'),
        body('type').isIn(['full-time', 'part-time', 'contract', 'internship']).withMessage('Invalid job type'),
        body('salary').optional().isNumeric().withMessage('Salary must be a number')
    ],
    updateJob: [
        body('title').optional().isString().trim().notEmpty().withMessage('Title cannot be empty'),
        body('description').optional().isString().trim().notEmpty().withMessage('Description cannot be empty'),
        body('requirements').optional().isArray().withMessage('Requirements must be an array'),
        body('requirements.*').optional().isString().withMessage('Each requirement must be a string'),
        body('location').optional().isString().trim().notEmpty().withMessage('Location cannot be empty'),
        body('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship']).withMessage('Invalid job type'),
        body('salary').optional().isNumeric().withMessage('Salary must be a number')
    ]
};

// Connection validation rules
const connectionRules = {
    connect: [
        body('targetId').isMongoId().withMessage('Invalid target ID'),
        body('message').optional().isString().trim().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters')
    ]
};

// Export validation middleware
module.exports = {
    validateId: [commonRules.id, validate],
    validatePagination: [commonRules.page, commonRules.limit, validate],
    validateSearch: [commonRules.search, validate],
    validateProfileUpdate: [...profileRules.updateProfile, validate],
    validateJobCreate: [...jobRules.createJob, validate],
    validateJobUpdate: [...jobRules.updateJob, validate],
    validateConnection: [...connectionRules.connect, validate]
}; 