import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadPost, clearUploadStatus, selectUploadStatus, selectUploadError } from '../../store/slices/uploadSlice';

const PostUpload = () => {
  const dispatch = useDispatch();
  const uploadStatus = useSelector(selectUploadStatus);
  const uploadError = useSelector(selectUploadError);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Clear form on successful upload
    if (uploadStatus === 'succeeded') {
      setFile(null);
      setPreview(null);
      setCaption('');
      setMediaType(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      dispatch(clearUploadStatus());
    }
  }, [uploadStatus, dispatch]);

  useEffect(() => {
    // Set error from Redux state
    if (uploadError) {
      console.error('Upload error from Redux:', uploadError);
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

    console.log('File selected:', {
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size
    });

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(selectedFile.type)) {
      console.error('Invalid file type:', selectedFile.type);
      setError('Invalid file type. Please upload an image (JPEG, PNG, GIF) or video (MP4, WebM).');
      return;
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      console.error('File too large:', selectedFile.size);
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    // Set media type based on file type
    if (selectedFile.type.startsWith('image/')) {
      setMediaType('image');
    } else if (selectedFile.type.startsWith('video/')) {
      setMediaType('video');
    }

    setFile(selectedFile);
    setError(null);

    // Create preview URL
    const previewUrl = URL.createObjectURL(selectedFile);
    setPreview(previewUrl);
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
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

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
            className="hidden"
          />
          
          {preview ? (
            <div className="space-y-2">
              {mediaType === 'image' ? (
                <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded" />
              ) : (
                <video src={preview} controls className="max-h-32 mx-auto rounded" />
              )}
              <p className="text-sm text-gray-600 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">Type: {mediaType}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg
                className="mx-auto h-8 w-8 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm text-gray-600">
                Drag and drop or click to upload
              </p>
              <p className="text-xs text-gray-500">
                JPEG, PNG, GIF, MP4, WebM (max 10MB)
              </p>
            </div>
          )}
        </div>

        <div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            rows={2}
            placeholder="Write a caption..."
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={!file || uploadStatus === 'loading'}
        >
          {uploadStatus === 'loading' ? 'Uploading...' : 'Upload Post'}
        </button>
      </form>
    </div>
  );
};

export default PostUpload; 