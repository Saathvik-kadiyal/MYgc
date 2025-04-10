import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { initiateCompanySignup } from '../store/slices/authSlice';

const CompanySignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'company' // Required field
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await dispatch(initiateCompanySignup(formData)).unwrap();
      navigate('/verify-otp', { 
        state: { 
          email: formData.email,
          accountType: 'company' 
        } 
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Company Registration</h2>
              <p className="mt-2 text-gray-600">Register your business account</p>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <Input
                  label="Company Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Business Email"
                  type="email"
                  name="email"
                  value={formData.email}
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
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Account Type"
                  name="role"
                  value="Company"
                  disabled
                  readOnly
                />
              </div>

              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={loading}
                >
                  Register Company
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

export default CompanySignupPage;
