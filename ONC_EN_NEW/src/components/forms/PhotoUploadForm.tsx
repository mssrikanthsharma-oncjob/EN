import React, { useCallback, useState } from 'react';
import type { PhotoData } from '../../types';

interface PhotoUploadFormProps {
  control: any;
  photos: PhotoData[];
  onPhotosChange: (photos: PhotoData[]) => void;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

const PhotoUploadForm: React.FC<PhotoUploadFormProps> = ({ photos, onPhotosChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  const validateImageQuality = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Check minimum dimensions for quality
        const minWidth = 200;
        const minHeight = 200;
        const isGoodQuality = img.width >= minWidth && img.height >= minHeight;
        URL.revokeObjectURL(img.src);
        resolve(isGoodQuality);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFiles = useCallback(async (files: FileList) => {
    setUploading(true);
    const validFiles: File[] = [];
    const errors: string[] = [];
    const progressArray: UploadProgress[] = [];

    // Initialize progress tracking
    Array.from(files).forEach(file => {
      progressArray.push({
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      });
    });
    setUploadProgress(progressArray);

    // Validate files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progressIndex = i;
      
      // Update progress
      setUploadProgress(prev => prev.map((p, idx) => 
        idx === progressIndex ? { ...p, progress: 10, status: 'uploading' } : p
      ));

      // Check file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`);
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === progressIndex ? { ...p, status: 'error', error: 'Invalid file type' } : p
        ));
        continue;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File too large. Maximum size is 10MB.`);
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === progressIndex ? { ...p, status: 'error', error: 'File too large' } : p
        ));
        continue;
      }

      // Update progress
      setUploadProgress(prev => prev.map((p, idx) => 
        idx === progressIndex ? { ...p, progress: 30 } : p
      ));

      // Validate image quality
      const isGoodQuality = await validateImageQuality(file);
      if (!isGoodQuality) {
        errors.push(`${file.name}: Image quality too low. Minimum 200x200 pixels required.`);
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === progressIndex ? { ...p, status: 'error', error: 'Image quality too low' } : p
        ));
        continue;
      }

      // Update progress
      setUploadProgress(prev => prev.map((p, idx) => 
        idx === progressIndex ? { ...p, progress: 60, status: 'processing' } : p
      ));

      validFiles.push(file);
    }

    if (errors.length > 0) {
      console.warn('File validation errors:', errors);
    }

    // Process valid files
    const newPhotos: PhotoData[] = [];
    
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const progressIndex = Array.from(files).findIndex(f => f.name === file.name);
      
      try {
        // Update progress
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === progressIndex ? { ...p, progress: 80, status: 'processing' } : p
        ));

        // Create preview URL
        const preview = URL.createObjectURL(file);
        
        // Convert to base64
        const base64 = await fileToBase64(file);
        
        // Validate the preview can be loaded
        const canLoadPreview = await validatePreview(preview);
        if (!canLoadPreview) {
          URL.revokeObjectURL(preview);
          setUploadProgress(prev => prev.map((p, idx) => 
            idx === progressIndex ? { ...p, status: 'error', error: 'Cannot generate preview' } : p
          ));
          continue;
        }
        
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
        
        // Complete progress
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === progressIndex ? { ...p, progress: 100, status: 'completed' } : p
        ));
        
      } catch (error) {
        console.error('Error processing file:', file.name, error);
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === progressIndex ? { ...p, status: 'error', error: 'Processing failed' } : p
        ));
      }
    }

    // Update photos array
    onPhotosChange([...photos, ...newPhotos]);
    
    // Clear progress after a delay
    setTimeout(() => {
      setUploadProgress([]);
      setUploading(false);
    }, 2000);
  }, [photos, onPhotosChange]);

  const validatePreview = (previewUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = previewUrl;
    });
  };

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
                      JPEG, PNG, WebP • Maximum 10MB per file • Minimum 200x200 pixels
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Upload Progress</h4>
              {uploadProgress.map((progress, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                      {progress.fileName}
                    </span>
                    <div className="flex items-center space-x-2">
                      {progress.status === 'completed' && (
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {progress.status === 'error' && (
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {(progress.status === 'uploading' || progress.status === 'processing') && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                      <span className="text-xs text-gray-500">
                        {progress.progress}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress.status === 'completed' ? 'bg-green-600' :
                        progress.status === 'error' ? 'bg-red-600' :
                        progress.status === 'processing' ? 'bg-yellow-600' :
                        'bg-blue-600'
                      }`}
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                  
                  {/* Status Text */}
                  <div className="mt-2 text-xs">
                    {progress.status === 'uploading' && (
                      <span className="text-blue-600">Uploading...</span>
                    )}
                    {progress.status === 'processing' && (
                      <span className="text-yellow-600">Processing image...</span>
                    )}
                    {progress.status === 'completed' && (
                      <span className="text-green-600">Upload completed</span>
                    )}
                    {progress.status === 'error' && (
                      <span className="text-red-600">
                        Error: {progress.error || 'Upload failed'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

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
                          onError={(e) => {
                            // Handle broken image
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                  <div class="text-center">
                                    <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                    </svg>
                                    <p class="text-xs text-gray-500">Preview failed</p>
                                  </div>
                                </div>
                              `;
                            }
                          }}
                          onLoad={(e) => {
                            // Validate image loaded successfully
                            const target = e.target as HTMLImageElement;
                            if (target.naturalWidth === 0 || target.naturalHeight === 0) {
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                    <div class="text-center">
                                      <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                      </svg>
                                      <p class="text-xs text-gray-500">Invalid image</p>
                                    </div>
                                  </div>
                                `;
                              }
                            }
                          }}
                        />
                      </div>
                      
                      {/* Photo Info Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-xl flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className="opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-all duration-200 shadow-lg"
                          title="Remove photo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Photo Metadata */}
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <p className="truncate font-medium" title={photo.file.name}>
                          {photo.file.name}
                        </p>
                        <div className="flex justify-between items-center">
                          <p className="text-gray-400">{formatFileSize(photo.metadata.size)}</p>
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-green-600 text-xs">Ready</span>
                          </div>
                        </div>
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
                <span>Minimum resolution: 200x200 pixels for quality assurance</span>
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
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Low quality images will be automatically rejected</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadForm;