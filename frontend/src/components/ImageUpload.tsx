import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ className = '' }) => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [fusedImage, setFusedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const selectedFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    if (selectedFiles.length > 0) {
      const newPreviews: string[] = [];
      selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === selectedFiles.length) {
            setPreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });

      setImages(prev => [...prev, ...selectedFiles].slice(0, 2)); // only allow 2 images
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 🚀 Fuse Images API Call
  const handleFuse = async () => {
    if (images.length !== 2) {
      alert("Please upload exactly 2 images for fusion.");
      return;
    }

    const formData = new FormData();
    formData.append("file1", images[0]);
    formData.append("file2", images[1]);

    const response = await fetch("http://localhost:8000/fuse", {
      method: "POST",
      body: formData,
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setFusedImage(url);
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleChange}
      />

      {images.length < 2 ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileSelector}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Upload 2 Images</h3>
          <p className="text-gray-400 mb-4">
            Drag & drop up to 2 images here, or click to browse
          </p>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Choose Files
          </button>
        </div>
      ) : (
        <div className="relative bg-gray-800 rounded-xl p-4">
          <div className="flex flex-wrap gap-4">
            {previews.map((src, index) => (
              <div key={index} className="relative w-1/2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-green-500" />
                    <span className="text-white font-medium">Image {index + 1}</span>
                  </div>
                  <button onClick={() => removeImage(index)}className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <img
                  src={src}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow"
                />
              </div>
            ))}
          </div>

          {/* Fuse Button */}
          <div className="mt-4 text-center">
            <button
              onClick={handleFuse}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Fuse Images
            </button>
          </div>

          {/* Show fused result */}
          {fusedImage && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-2">Fused Result:</h3>
              <img
                src={fusedImage}
                alt="Fused"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
