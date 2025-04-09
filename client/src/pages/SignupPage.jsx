import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Select from '../components/common/Select';
import { initiateSignup } from '../store/slices/authSlice';

const SignupPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    type: location.state?.type || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(initiateSignup(formData)).unwrap();
      if (result.email) {
        navigate('/verify-otp', { state: { email: formData.email } });
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
              <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
              <p className="mt-2 text-gray-600">Join our community of creators</p>
            </div>

            {error && (
              <Alert type="error" message={error} onClose={() => dispatch({ type: 'auth/clearError' })} />
            )}

            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <Input
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
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
                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
                <Select
                  label="Type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={[
                    { value: 'experienced', label: 'Experienced Creator' },
                    { value: 'fresher', label: 'Fresher Creator' },
                    { value: 'company', label: 'Company' },
                  ]}
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
                  Sign Up
                </Button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
