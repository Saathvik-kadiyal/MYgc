// src/pages/VerifyOtpPage.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifySignup, initiateSignup, clearError } from '../store/slices/authSlice';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { signupData, loading, error } = useSelector((state) => state.auth);

  const email = location.state?.email || signupData?.email;

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(verifySignup({ email, otp })).unwrap();
      alert('Account created successfully!');
      navigate('/login');
    } catch (err) {
      alert('Invalid or expired OTP');
    }
  };

  const handleResendOtp = async () => {
    try {
      if (signupData) {
        await dispatch(initiateSignup(signupData)).unwrap();
        alert('OTP resent to your email');
      } else {
        alert('Signup data not found');
        navigate('/signup');
      }
    } catch (err) {
      alert('Error resending OTP');
    }
  };

  return (
    <div className="container">
      <h2>Verify OTP</h2>
      <form onSubmit={handleVerifyOtp}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
      <button onClick={handleResendOtp} disabled={loading}>
        Resend OTP
      </button>
    </div>
  );
};

export default VerifyOtpPage;
