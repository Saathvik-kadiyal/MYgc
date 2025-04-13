const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user.model');
const Company = require('../src/models/company.model');

describe('Authentication Tests', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI_TEST);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Company.deleteMany({});
    });

    describe('User Authentication', () => {
        it('should signup a new user', async () => {
            const res = await request(app)
                .post('/api/auth/signup/initiate')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'user'
                });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Verification code sent');
        });

        it('should login a user', async () => {
            // First create a user
            await User.create({
                email: 'test@example.com',
                password: 'password123',
                role: 'user',
                isVerified: true
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
        });
    });

    describe('Company Authentication', () => {
        it('should signup a new company', async () => {
            const res = await request(app)
                .post('/api/auth/signup/initiate')
                .send({
                    email: 'company@example.com',
                    password: 'password123',
                    role: 'company'
                });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Verification code sent');
        });

        it('should login a company', async () => {
            // First create a company
            await Company.create({
                email: 'company@example.com',
                password: 'password123',
                role: 'company',
                isVerified: true
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'company@example.com',
                    password: 'password123'
                });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
        });
    });
}); 