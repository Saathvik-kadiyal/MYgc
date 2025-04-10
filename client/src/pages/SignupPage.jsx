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

  const isCompany = location.state?.type === 'company';
  const [formData, setFormData] = useState(
    isCompany 
      ? { // Company fields
          username: '',
          email: '',
          password: '',
          role: 'company'
        }
      : { // User fields
          username: '',
          email: '',
          password: '',
          phoneNumber: '',
          category: '',
          interestedCategories: []
        }
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const signupData = {
        ...formData,
        type: formData.role === 'company' ? null : formData.type
      };
      const result = await dispatch(initiateSignup(signupData)).unwrap();
      if (result.email) {
        navigate('/verify-otp', { 
          state: { 
            email: formData.email,
            type: formData.role 
          } 
        });
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
                {!isCompany && (
                  <>
                    <Input
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                    <Select
                      label="Category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      options={[
                        { value: 'Photographer', label: 'Photographer' },
                        { value: 'Video', label: 'Videographer' },
                      ]}
                      required
                    />
                    <Select
                      label="Primary Category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      options={[
                        { value: 'Photographer', label: 'Photographer' },
                        { value: 'Video', label: 'Videographer' }
                      ]}
                      required
                    />
                    <Select
                      label="Also Interested In"
                      name="interestedCategories"
                      value={formData.interestedCategories[0] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        interestedCategories: [e.target.value]
                      })}
                      options={[
                        { value: 'Photographer', label: 'Photographer' },
                        { value: 'Video', label: 'Videographer' }
                      ]}
                    />
                  </>
                )}
                {isCompany && <input type="hidden" name="role" value="company" />}
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
