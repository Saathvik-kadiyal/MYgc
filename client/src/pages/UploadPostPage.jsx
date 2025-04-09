import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { uploadPost, clearUploadStatus, selectUploadStatus, selectUploadError, selectLastUploadedPost } from '../store/slices/uploadSlice';
import { FiUpload, FiX } from 'react-icons/fi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UploadPostPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const uploadStatus = useSelector(selectUploadStatus);
  const uploadError = useSelector(selectUploadError);
  const lastUploadedPost = useSelector(selectLastUploadedPost);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [mediaType, setMediaType] = useState(null);

  useEffect(() => {
    // Clear upload status when component unmounts
    return () => {
      dispatch(clearUploadStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (uploadStatus === 'succeeded' && lastUploadedPost) {
      // Navigate to feed after successful upload
      navigate('/feed');
    }
  }, [uploadStatus, navigate, lastUploadedPost]);

  useEffect(() => {
    if (uploadError) {
      setError(uploadError);
    }
  }, [uploadError]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload an image (JPEG, PNG, GIF) or video (MP4, MOV) file');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    // Set media type based on file type
    if (selectedFile.type.startsWith('image/')) {
      setMediaType('image');
    } else if (selectedFile.type.startsWith('video/')) {
      setMediaType('video');
    }

    setFile(selectedFile);
    setError('');

    // Create preview URL
    const previewUrl = URL.createObjectURL(selectedFile);
    setPreview(previewUrl);

    // Clean up preview URL when component unmounts or file changes
    return () => URL.revokeObjectURL(previewUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      console.log('Submitting upload with:', { 
        file: file.name, 
        caption, 
        mediaType,
        fileType: file.type,
        fileSize: file.size
      });
      
      // Create a new FormData object
      const formData = new FormData();
      formData.append('media', file);
      formData.append('caption', caption);
      formData.append('mediaType', mediaType);
      
      // Log the FormData contents
      for (let pair of formData.entries()) {
        console.log('FormData entry:', pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }
      
      // Dispatch the upload action
      const result = await dispatch(uploadPost({ file, caption, mediaType })).unwrap();
      console.log('Upload successful:', result);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload post');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setMediaType(null);
    setError('');
  };

  if (uploadStatus === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-white">Upload Post</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            file ? 'border-green-500' : 'border-gray-700'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="space-y-4">
              <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">
                  Drag and drop your file here, or{' '}
                  <label className="text-blue-500 hover:text-blue-600 cursor-pointer">
                    browse
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/mp4,video/quicktime"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPEG, PNG, GIF, MP4, MOV (max 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {mediaType === 'image' ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-64 mx-auto rounded-lg"
                />
              ) : (
                <video 
                  src={preview} 
                  controls 
                  className="max-h-64 mx-auto rounded-lg"
                />
              )}
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <FiX size={20} />
              </button>
              <p className="mt-2 text-sm text-gray-400">{file.name}</p>
              <p className="text-xs text-gray-500">Type: {mediaType}</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="caption" className="block text-sm font-medium text-gray-300 mb-1">
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Add a caption to your post..."
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          disabled={!file || uploadStatus === 'loading'}
        >
          {uploadStatus === 'loading' ? 'Uploading...' : 'Upload Post'}
        </button>
      </form>
    </div>
  );
};

export default UploadPostPage; 