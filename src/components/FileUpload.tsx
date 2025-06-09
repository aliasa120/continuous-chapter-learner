
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileAudio, FileVideo, Upload, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface FileUploadProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const FileUpload: React.FC<FileUploadProps> = ({ file, setFile }) => {
  const { maxFileSizeMB, maxDurationMinutes } = useSettings();
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.aiff'],
      'video/*': ['.mp4', '.mov', '.avi', '.wmv', '.mpeg', '.mpg', '.webm', '.3gpp', '.flv']
    },
    maxSize: maxFileSizeMB * 1024 * 1024, // Convert MB to bytes
    multiple: false
  });

  const removeFile = () => {
    setFile(null);
  };

  const getFileIcon = () => {
    if (!file) return null;
    
    if (file.type.startsWith('audio/')) {
      return <FileAudio className="h-10 w-10 text-green-500" />;
    } else {
      return <FileVideo className="h-10 w-10 text-green-600" />;
    }
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-green-500 bg-green-50'
              : 'border-green-200 hover:border-green-400 hover:bg-green-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-green-500" />
          <p className="mt-2 text-sm font-medium text-gray-600">
            {isDragActive
              ? "Drop your file here..."
              : "Drag & drop an audio/video file, or click to browse"
            }
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Audio: MP3, WAV, FLAC, AAC, OGG, AIFF, M4A
          </p>
          <p className="text-xs text-gray-500">
            Video: MP4, MOV, AVI, WMV, MPEG, WEBM, FLV
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Max: {maxFileSizeMB}MB, Duration: {maxDurationMinutes} minutes
          </p>
        </div>
      ) : (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
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
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 hover:bg-green-100"
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
