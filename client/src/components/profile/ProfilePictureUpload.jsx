import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadProfilePicture } from '../../store/slices/userSlice';
import Button from '../common/Button';

const ProfilePictureUpload = ({ userId }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const isUploading = useSelector(state => state.user.isUploading);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Validate file
    if (!selectedFile) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only images (JPEG, PNG, GIF) are allowed');
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      await dispatch(uploadProfilePicture(formData)).unwrap();
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.message || 'Failed to upload');
    }
  };

  return (
    <div className="space-y-4">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleChange}
        className="hidden"
        id="profile-upload"
      />
      <label htmlFor="profile-upload" className="cursor-pointer">
        {preview ? (
          <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
            <span>Upload</span>
          </div>
        )}
      </label>
      
      {file && (
        <div className="space-y-2">
          <p className="text-sm">{file.name}</p>
          <Button 
            onClick={handleSubmit}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Save Picture'}
          </Button>
        </div>
      )}
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default ProfilePictureUpload;
