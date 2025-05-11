
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileAudio, FileVideo, Upload, X } from 'lucide-react';

interface FileUploadProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const FileUpload: React.FC<FileUploadProps> = ({ file, setFile }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg'],
      'video/*': ['.mp4', '.mov', '.avi', '.wmv']
    },
    maxSize: 104857600, // 100MB
    multiple: false
  });

  const removeFile = () => {
    setFile(null);
  };

  const getFileIcon = () => {
    if (!file) return null;
    
    if (file.type.startsWith('audio/')) {
      return <FileAudio className="h-10 w-10 text-indigo-500" />;
    } else {
      return <FileVideo className="h-10 w-10 text-purple-500" />;
    }
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 mx-auto text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-600">
            {isDragActive
              ? "Drop your file here..."
              : "Drag & drop an audio/video file, or click to browse"
          }
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Supports MP3, WAV, MP4, MOV (max 100MB)
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center">
            {getFileIcon()}
            <div className="ml-3 flex-1 truncate">
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
