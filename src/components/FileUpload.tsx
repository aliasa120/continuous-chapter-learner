
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileAudio, FileVideo, Upload, X, AlertTriangle } from 'lucide-react';

interface FileUploadProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const FileUpload: React.FC<FileUploadProps> = ({ file, setFile }) => {
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Mobile-optimized file handling
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const maxFileSize = isMobile ? 25 * 1024 * 1024 : 100 * 1024 * 1024; // 25MB for mobile, 100MB for desktop

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setUploadError(`File too large. Maximum size: ${isMobile ? '25MB' : '100MB'}`);
      } else {
        setUploadError('Invalid file type. Please select an audio or video file.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      // Additional mobile-specific validations
      if (isMobile && selectedFile.size > maxFileSize) {
        setUploadError('File too large for mobile. Please use a file smaller than 25MB.');
        return;
      }
      
      console.log('File selected:', selectedFile.name, 'Size:', (selectedFile.size / 1024 / 1024).toFixed(2), 'MB');
      setFile(selectedFile);
    }
  }, [setFile, isMobile, maxFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm'],
      'video/*': ['.mp4', '.mov', '.avi', '.wmv', '.webm']
    },
    maxSize: maxFileSize,
    multiple: false,
    // Mobile-specific optimizations
    noClick: false,
    noKeyboard: isMobile,
    preventDropOnDocument: true
  });

  const removeFile = () => {
    setFile(null);
    setUploadError(null);
  };

  const getFileIcon = () => {
    if (!file) return null;
    
    if (file.type.startsWith('audio/')) {
      return <FileAudio className="h-6 w-6 sm:h-10 sm:w-10 text-green-500" />;
    } else {
      return <FileVideo className="h-6 w-6 sm:h-10 sm:w-10 text-green-600" />;
    }
  };

  return (
    <div className="w-full">
      {!file ? (
        <div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-green-500 bg-green-50'
                : 'border-green-200 hover:border-green-400 hover:bg-green-50'
            } ${uploadError ? 'border-red-300 bg-red-50' : ''}`}
          >
            <input {...getInputProps()} />
            {uploadError ? (
              <AlertTriangle className="h-6 w-6 sm:h-10 sm:w-10 mx-auto text-red-500" />
            ) : (
              <Upload className="h-6 w-6 sm:h-10 sm:w-10 mx-auto text-green-500" />
            )}
            <p className="mt-2 text-xs sm:text-sm font-medium text-gray-600">
              {uploadError ? uploadError : (
                isDragActive
                  ? "Drop your file here..."
                  : "Tap to select or drag & drop"
              )}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {isMobile ? 'Audio/Video files (max 25MB)' : 'Supports MP3, WAV, MP4, MOV (max 100MB)'}
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-green-200 rounded-lg p-3 sm:p-4 bg-green-50">
          <div className="flex items-center">
            {getFileIcon()}
            <div className="ml-2 sm:ml-3 flex-1 truncate">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
                {isMobile && file.size > 15 * 1024 * 1024 && (
                  <span className="text-orange-600 ml-1">(Large file - may take longer)</span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-green-100"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
