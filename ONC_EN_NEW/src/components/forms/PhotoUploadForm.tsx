import React, { useCallback, useState } from 'react';
import type { PhotoData } from '../../types';

interface PhotoUploadFormProps {
  control: any;
  photos: PhotoData[];
  onPhotosChange: (photos: PhotoData[]) => void;
}

const PhotoUploadForm: React.FC<PhotoUploadFormProps> = ({ photos, onPhotosChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(async (files: FileList) => {
    setUploading(true);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files
    Array.from(files).forEach(file => {
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`);
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File too large. Maximum size is 10MB.`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    // Process valid files
    const newPhotos: PhotoData[] = [];
    
    for (const file of validFiles) {
      try {
        // Create preview URL
        const preview = URL.createObjectURL(file);
        
        // Convert to base64
        const base64 = await fileToBase64(file);
        
        const photoData: PhotoData = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file,
          preview,
          base64,
          metadata: {
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          },
        };
        
        newPhotos.push(photoData);
      } catch (error) {
        console.error('Error processing file:', file.name, error);
        errors.push(`${file.name}: Error processing file.`);
      }
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    // Update photos array
    onPhotosChange([...photos, ...newPhotos]);
    setUploading(false);
  }, [photos, onPhotosChange]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removePhoto = useCallback((photoId: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    // Clean up preview URLs
    const photoToRemove = photos.find(photo => photo.id === photoId);
    if (photoToRemove) {
      URL.revokeObjectURL(photoToRemove.preview);
    }
    onPhotosChange(updatedPhotos);
  }, [photos, onPhotosChange]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-engineering-subtitle">
              Photo Documentation
            </h2>
            <p className="text-engineering-body mt-1">
              Upload photos of structural issues and site conditions
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                <svg
                  className="h-6 w-6 text-blue-600"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              
              <div className="text-sm">
                {uploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-600 font-medium">Processing files...</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-gray-700">
                      <span className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                        Click to upload
                      </span>{' '}
                      or drag and drop files here
                    </p>
                    <p className="text-xs text-gray-500">
                      JPEG, PNG, WebP • Maximum 10MB per file
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Photo Grid */}
          {photos.length > 0 && (
            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-engineering-subtitle mb-4">
                  Uploaded Photos ({photos.length})
                </h3>
                
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <img
                          src={photo.preview}
                          alt="Uploaded photo"
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                      
                      {/* Photo Info Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-xl flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-all duration-200 shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Photo Metadata */}
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <p className="truncate font-medium">{photo.file.name}</p>
                        <p className="text-gray-400">{formatFileSize(photo.metadata.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upload Instructions */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Photography Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Take clear, well-lit photos of structural issues</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Include reference objects for scale when possible</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Capture multiple angles of the same issue</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Ensure photos are in focus and properly oriented</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadForm;