import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { manualLogin } from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  // If already authenticated, redirect to feed
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/feed');
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await dispatch(manualLogin(formData)).unwrap();
      // If login is successful, navigate to feed page
      navigate('/feed');
    } catch (err) {
      // Error is handled by Redux
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-w-screen min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="bg-gray-900 border border-gray-800">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-black">Sign in to your account</h2>
              <p className="mt-2 text-gray-700">
                Welcome back! Please enter your details.
              </p>
            </div>

            {error && (
              <Alert type="error" message={error} onClose={() => dispatch({ type: 'auth/clearError' })} />
            )}

            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
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
              </div>

              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={loading}
                >
                  Sign in
                </Button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-700">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="text-black hover:text-gray-900 font-medium"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
