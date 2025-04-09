import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { verifySignup, initiateSignup, selectSignupData } from '../store/slices/authSlice';

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const signupData = useSelector(selectSignupData);
  const email = location.state?.email || signupData?.email;

  const [otp, setOtp] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  // Redirect if no email in state or signup data
  if (!email) {
    navigate('/signup');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(verifySignup({ email, otp })).unwrap();
      // If verification is successful, navigate to feed page
      navigate('/feed');
    } catch (err) {
      // Error is handled by Redux
    }
  };

  const handleResendOtp = async () => {
    try {
      if (!signupData) {
        setResendMessage('Unable to resend OTP. Please try signing up again.');
        return;
      }
      const result = await dispatch(initiateSignup(signupData)).unwrap();
      if (result.email) {
        setResendMessage('OTP has been resent to your email');
      }
    } catch (err) {
      // Error is handled by Redux
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
              <p className="mt-2 text-gray-600">
                We've sent a verification code to {email}
              </p>
            </div>

            {(error || resendMessage) && (
              <Alert 
                type={resendMessage ? 'success' : 'error'} 
                message={resendMessage || error} 
                onClose={() => {
                  if (resendMessage) setResendMessage('');
                  if (error) dispatch({ type: 'auth/clearError' });
                }} 
              />
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input
                  label="Verification Code"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the 6-digit code"
                  required
                />
              </div>

              <div className="mt-6 space-y-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={loading}
                >
                  Verify Email
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Resend verification code
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
