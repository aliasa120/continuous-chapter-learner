
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileAudio, FileVideo, Upload, X } from 'lucide-react';

interface FileUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ file, setFile }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles);
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      console.log('Selected file:', selectedFile.name, 'Size:', selectedFile.size, 'Type:', selectedFile.type);
      setFile(selectedFile);
    }
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'],
      'video/*': ['.mp4', '.mov', '.avi', '.wmv', '.webm', '.mkv']
    },
    maxSize: 104857600, // 100MB
    multiple: false,
    noClick: false,
    noKeyboard: false
  });

  // Log file rejection reasons
  React.useEffect(() => {
    if (fileRejections.length > 0) {
      console.log('File rejections:', fileRejections);
      fileRejections.forEach(rejection => {
        console.log('Rejected file:', rejection.file.name, 'Errors:', rejection.errors);
      });
    }
  }, [fileRejections]);

  const removeFile = () => {
    console.log('Removing file:', file?.name);
    setFile(null);
  };

  const getFileIcon = () => {
    if (!file) return null;
    
    if (file.type.startsWith('audio/')) {
      return <FileAudio className="h-8 w-8 sm:h-10 sm:w-10 text-green-500" />;
    } else {
      return <FileVideo className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-all duration-200 touch-manipulation ${
            isDragActive
              ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
              : 'border-green-200 hover:border-green-400 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/20'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-green-500" />
          <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            {isDragActive
              ? "Drop your file here..."
              : "Tap to select or drag & drop an audio/video file"
          }
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Supports MP3, WAV, MP4, MOV and more (max 100MB)
          </p>
          {fileRejections.length > 0 && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
              {fileRejections[0]?.errors[0]?.message || 'File upload failed'}
            </div>
          )}
        </div>
      ) : (
        <div className="border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4 bg-green-50 dark:bg-green-950/20">
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)} • {file.type}
              </p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors touch-manipulation"
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
