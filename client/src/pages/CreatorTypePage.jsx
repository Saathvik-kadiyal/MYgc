import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const CreatorTypePage = () => {
  const [selectedType, setSelectedType] = useState(''); // Initial state is empty
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedType) {
      navigate('/signup', { 
        state: { 
          type: selectedType, 
          isDisabled: true 
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">Select Your Experience Level</h2>
              <p className="mt-2 text-gray-600">Choose the option that best describes you</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="creatorType"
                  value="experienced"
                  checked={selectedType === 'experienced'}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">Experienced Creator</span>
                  <span className="block text-sm text-gray-500">I have previous experience creating content</span>
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="creatorType"
                  value="fresher"
                  checked={selectedType === 'fresher'}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">Fresher</span>
                  <span className="block text-sm text-gray-500">I'm new to content creation</span>
                </div>
              </label>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/')}
              >
                Back
              </Button>
              <Button
                variant="primary"
                fullWidth
                disabled={!selectedType}
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreatorTypePage;