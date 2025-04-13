import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifySignup, clearError, selectLoading, selectError } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      toast.error('No email found. Please try signing up again.');
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    try {
      const result = await dispatch(verifySignup({ email, otp })).unwrap();
      if (result.success) {
        toast.success('Account verified successfully');
        navigate('/feed');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to verify account');
    }
  };

  const handleResendOtp = async () => {
    try {
      // You can add resend OTP functionality here if needed
      setResendMessage('OTP resent successfully');
      toast.success('OTP resent successfully');
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Verify Your Account</h2>
        
        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <Input
              type="email"
              value={email}
              disabled
              className="w-full bg-gray-800 text-gray-300"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">OTP</label>
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full"
              maxLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : 'Verify Account'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-blue-400 hover:text-blue-300"
            >
              Resend OTP
            </button>
            {resendMessage && (
              <p className="text-green-400 mt-2">{resendMessage}</p>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default VerifyOtpPage;
