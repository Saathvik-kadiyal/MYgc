import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initiateSignup, clearError } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Select from '../components/common/Select';

const SignupPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error, role } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        phoneNumber: '',
        type: 'student',
        category: ''
    });

    useEffect(() => {
        if (!role) {
            toast.error('Please select a role first');
            navigate('/');
        }
    }, [role, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearError());

        // Validate required fields based on role
        if (role === 'user') {
            if (!formData.email || !formData.username || !formData.password || !formData.phoneNumber || !formData.type) {
                toast.error('Please fill in all required fields');
                return;
            }
        } else if (role === 'company') {
            if (!formData.email || !formData.username || !formData.password || !formData.category) {
                toast.error('Please fill in all required fields');
                return;
            }
        }

        try {
            const result = await dispatch(initiateSignup({ ...formData, role })).unwrap();
            if (result.success) {
                toast.success('OTP sent to your email');
                navigate('/verify', { state: { email: formData.email } });
            }
        } catch (error) {
            console.error('Signup error:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Create Your Account
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Username"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    {role === 'user' && (
                        <>
                            <Input
                                label="Phone Number"
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                            />

                            <Select
                                label="User Type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                options={[
                                    { value: 'student', label: 'Student' },
                                    { value: 'professional', label: 'Professional' }
                                ]}
                            />
                        </>
                    )}

                    {role === 'company' && (
                        <Input
                            label="Company Category"
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        />
                    )}

                    {error && (
                        <Alert type="error" message={error} />
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? 'Signing up...' : 'Sign up'}
                    </Button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Button
                            variant="link"
                            onClick={() => navigate('/login')}
                        >
                            Log in
                        </Button>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default SignupPage;
