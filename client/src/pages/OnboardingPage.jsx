import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { initiateSignup } from '../store/slices/authSlice';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Select from '../components/common/Select';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const preselectedType = searchParams.get('type');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    type: preselectedType || '',
    experience: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await dispatch(initiateSignup(formData)).unwrap();
      if (result.success) {
        navigate('/verify-email', { state: { email: formData.email } });
      }
    } catch (err) {
      setError(err.message || 'Failed to complete signup');
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
              <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
              <p className="mt-2 text-gray-600">Join our community of creators</p>
            </div>

            {error && (
              <Alert type="error" message={error} onClose={() => setError('')} />
            )}

            <form onSubmit={handleSubmit}>
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
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
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
                  disabled={!!preselectedType}
                  required
                />

                {formData.type === 'experienced' && (
                  <Input
                    label="Years of Experience"
                    name="experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Enter years of experience"
                    required
                  />
                )}
              </div>

              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={loading}
                >
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
