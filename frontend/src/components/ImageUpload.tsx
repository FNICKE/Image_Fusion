import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle2, Download, RefreshCw, Info, TrendingUp, Clock, Zap, AlertTriangle } from 'lucide-react';

interface ImageUploadProps {
  className?: string;
  onImageUpload?: (file: File) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ className = '', onImageUpload }) => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [fusing, setFusing] = useState(false);
  const [fusedImage, setFusedImage] = useState<string | null>(null);
  const [fusionMethod, setFusionMethod] = useState<string>('laplacian');
  const [explanation, setExplanation] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 10;
  const MIN_SELECTION = 2;

  const fusionMethods = {
    weighted: {
      name: 'Weighted Average',
      description: 'Fast processing for rapid assessment',
      icon: '⚖️',
      speed: 'Fast',
      quality: 'Good',
      bestFor: 'Emergency response'
    },
    laplacian: {
      name: 'Laplacian Pyramid',
      description: 'Best detail preservation',
      icon: '🔍',
      speed: 'Medium',
      quality: 'Excellent',
      bestFor: 'Detailed analysis'
    },
    adaptive: {
      name: 'Adaptive Statistical',
      description: 'Context-aware, highest quality',
      icon: '🧠',
      speed: 'Slower',
      quality: 'Superior',
      bestFor: 'Complex scenes'
    }
  };

  const handleFiles = (files: FileList) => {
    const picked = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!picked.length) return;

    const room = Math.max(0, MAX_FILES - images.length);
    const toAdd = picked.slice(0, room);

    // Notify parent component about first image upload
    if (onImageUpload && toAdd.length > 0) {
      onImageUpload(toAdd[0]);
    }

    const newPreviews: string[] = [];
    let done = 0;
    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        newPreviews.push(e.target?.result as string);
        done++;
        if (done === toAdd.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImages(prev => [...prev, ...toAdd]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const openFileSelector = () => fileInputRef.current?.click();

  const toggleSelect = (idx: number) => {
    setSelected(prev => {
      const exists = prev.includes(idx);
      if (exists) {
        return prev.filter(i => i !== idx);
      } else {
        return [...prev, idx];
      }
    });
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
    setSelected(prev => prev.filter(i => i !== idx).map(i => (i > idx ? i - 1 : i)));
  };

  const clearAll = () => {
    setImages([]);
    setPreviews([]);
    setSelected([]);
    setFusedImage(null);
    setExplanation(null);
    setShowExplanation(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectAll = () => {
    setSelected(images.map((_, idx) => idx));
  };

  const clearSelection = () => {
    setSelected([]);
  };

  const simulateProcessingSteps = () => {
    const steps = [
      'Analyzing image quality...',
      'Aligning images...',
      'Applying fusion algorithm...',
      'Enhancing details...',
      'Generating quality report...',
      'Finalizing result...'
    ];
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setProcessingStep(steps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setProcessingStep('');
      }
    }, 500);
  };

  const handleFuseSelected = async () => {
    if (selected.length < MIN_SELECTION) {
      alert(`Please select at least ${MIN_SELECTION} images to fuse.`);
      return;
    }

    const formData = new FormData();
    selected.forEach(idx => {
      formData.append('files', images[idx]);
    });
    formData.append('method', fusionMethod);

    try {
      setFusing(true);
      setExplanation(null);
      setFusedImage(null);
      simulateProcessingSteps();
      
      const response = await fetch('http://localhost:8000/fuse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Fusion failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setFusedImage(url);

      // Extract filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      let imageName = 'fused_image.jpg';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch) {
          imageName = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Try to get explanation
      try {
        const explanationResponse = await fetch(`http://localhost:8000/explanation/${imageName}`);
        if (explanationResponse.ok) {
          const explanationData = await explanationResponse.json();
          setExplanation(explanationData);
        }
      } catch (explError) {
        console.warn('Could not fetch explanation:', explError);
      }
      
    } catch (err) {
      console.error('Fusion error:', err);
      alert(`Fusion failed: ${err}`);
    } finally {
      setFusing(false);
      setProcessingStep('');
    }
  };

  const downloadFusedImage = () => {
    if (!fusedImage) return;
    
    const link = document.createElement('a');
    link.href = fusedImage;
    link.download = `disasterscope-fused-${fusionMethod}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getQualityColor = (value: string) => {
    const numValue = parseFloat(value.replace('%', ''));
    if (numValue >= 50) return 'text-green-400';
    if (numValue >= 20) return 'text-yellow-400';
    if (numValue >= 0) return 'text-blue-400';
    return 'text-red-400';
  };

  const renderQualityMetric = (label: string, value: string, description: string) => (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-300 font-medium">{label}</span>
        <span className={`font-bold text-lg ${getQualityColor(value)}`}>{value}</span>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r ${
            getQualityColor(value).includes('green') ? 'from-green-500 to-green-400' :
            getQualityColor(value).includes('yellow') ? 'from-yellow-500 to-yellow-400' :
            getQualityColor(value).includes('blue') ? 'from-blue-500 to-blue-400' :
            'from-red-500 to-red-400'
          }`}
          style={{ width: `${Math.min(Math.abs(parseFloat(value)), 100)}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );

  return (
    <div className={`w-full max-w-6xl mx-auto ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleChange}
      />

      {/* Dropzone */}
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
        <h3 className="text-lg font-semibold text-white mb-2">Upload Disaster Images for Analysis</h3>
        <p className="text-gray-400 mb-4">
          Drag & drop up to {MAX_FILES} drone/satellite images here, or click to browse
        </p>
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          Choose Images
        </button>
      </div>

      {/* Fusion Method Selection */}
      {images.length > 0 && (
        <div className="mt-6 bg-gray-800 rounded-xl p-6">
          <h4 className="text-white font-medium mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            Select Fusion Method for Disaster Assessment
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(fusionMethods).map(([key, method]) => (
              <button
                key={key}
                onClick={() => setFusionMethod(key)}
                className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                  fusionMethod === key
                    ? 'border-blue-500 bg-blue-500/10 text-white shadow-lg'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-xs opacity-75">{method.description}</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-gray-400">Speed: {method.speed}</span>
                  <span className="text-gray-400">Quality: {method.quality}</span>
                </div>
                <div className="text-xs text-blue-300 mt-1">Best for: {method.bestFor}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gallery */}
      {images.length > 0 && (
        <div className="mt-6 bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-white font-medium">
              Images: {images.length} | Selected: {selected.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm px-3 py-1 rounded"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm px-3 py-1 rounded"
              >
                Clear Selection
              </button>
              <button
                onClick={clearAll}
                className="text-red-400 hover:text-red-300 transition-colors text-sm px-3 py-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {previews.map((src, idx) => {
              const isSelected = selected.includes(idx);
              return (
                <div
                  key={idx}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    isSelected 
                      ? 'border-green-500 shadow-lg shadow-green-500/20 scale-105' 
                      : 'border-transparent hover:border-gray-500'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(idx);
                    }}
                    className={`absolute top-2 left-2 z-10 rounded-full p-1 transition-all duration-200 ${
                      isSelected 
                        ? 'bg-green-500 scale-110' 
                        : 'bg-black/60 hover:bg-black/80'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-300'}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute top-2 right-2 z-10 rounded-full p-1 bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {isSelected && (
                    <div className="absolute top-2 right-8 z-10 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {selected.indexOf(idx) + 1}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>Image {idx + 1}</span>
                  </div>

                  <img 
                    src={src} 
                    alt={`Disaster Image ${idx + 1}`} 
                    className="w-full h-32 object-cover cursor-pointer" 
                    onClick={() => toggleSelect(idx)}
                  />
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={handleFuseSelected}
              disabled={selected.length < MIN_SELECTION || fusing}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                selected.length >= MIN_SELECTION && !fusing
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg transform hover:scale-105'
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
            >
              {fusing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing & Fusing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Enhance {selected.length} Images
                </>
              )}
            </button>
            
            <div className="text-sm text-gray-400">
              Method: <span className="text-blue-400 font-medium">{fusionMethods[fusionMethod as keyof typeof fusionMethods].name}</span>
            </div>
          </div>

          {/* Processing Status */}
          {fusing && processingStep && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="text-blue-300">{processingStep}</span>
              </div>
            </div>
          )}

          {/* Selected Images Preview */}
          {selected.length > 0 && (
            <div className="mt-6 p-4 bg-gray-900 rounded-lg">
              <h4 className="text-white font-medium mb-3">Selected for Analysis ({selected.length}):</h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {selected.map((imgIdx, selectIdx) => (
                  <div key={imgIdx} className="flex-shrink-0 relative">
                    <img 
                      src={previews[imgIdx]} 
                      alt={`Selected ${selectIdx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border-2 border-green-500"
                    />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {selectIdx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Fusion Result */}
          {fusedImage && (
            <div className="mt-8 p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/40">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-purple-400" />
                  Enhanced Disaster Assessment Image
                </h3>
                <div className="flex gap-3">
                  {explanation && (
                    <button
                      onClick={() => setShowExplanation(!showExplanation)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Info className="w-4 h-4" />
                      {showExplanation ? 'Hide' : 'Show'} Analysis
                    </button>
                  )}
                  <button
                    onClick={downloadFusedImage}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
              
              <div className="bg-black/40 rounded-lg p-4 mb-6">
                <img 
                  src={fusedImage} 
                  alt="Enhanced Disaster Assessment" 
                  className="w-full max-h-96 object-contain rounded-lg shadow-2xl border border-purple-500/30" 
                />
              </div>
              
              <div className="text-center mb-6">
                <div className="text-sm text-gray-300 mb-2">
                  Enhanced assessment image created from {selected.length} source images
                </div>
                <div className="text-lg font-medium text-white">
                  Method: {fusionMethods[fusionMethod as keyof typeof fusionMethods].name}
                </div>
                {explanation && explanation.technical_details && (
                  <div className="mt-2 flex justify-center gap-6 text-sm">
                    <span className="text-green-400">
                      Quality Score: {explanation.technical_details.quality_score}/100
                    </span>
                    <span className="text-blue-400">
                      Processing Time: {explanation.processing_time}
                    </span>
                  </div>
                )}
              </div>

              {/* Detailed Analysis Panel */}
              {explanation && showExplanation && (
                <div className="mt-6 p-6 bg-gray-900/70 rounded-xl border border-gray-700">
                  <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Disaster Assessment Quality Analysis
                  </h4>
                  
                  {/* Processing Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-lg p-5">
                      <h5 className="text-white font-medium mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        Processing Summary
                      </h5>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Algorithm:</span>
                          <span className="text-white">{explanation.fusion_method.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Processing Time:</span>
                          <span className="text-green-400">{explanation.processing_time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Resolution:</span>
                          <span className="text-white">{explanation.technical_details.resolution}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Images Fused:</span>
                          <span className="text-blue-400">{explanation.technical_details.number_of_images}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Overall Quality:</span>
                          <span className="text-purple-400">{explanation.technical_details.quality_score}/100</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-5">
                      <h5 className="text-white font-medium mb-4">Method & Suitability</h5>
                      <p className="text-gray-300 text-sm leading-relaxed mb-4">
                        {explanation.fusion_method.description}
                      </p>
                      
                      {explanation.disaster_assessment_context && (
                        <div className="mt-4">
                          <div className="text-xs text-gray-400 mb-2">Assessment Rating:</div>
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-yellow-300">
                              {explanation.disaster_assessment_context.suitability}
                            </span>
                          </div>
                        </div>
                      )}

                      {explanation.fusion_method.benefits && (
                        <div className="flex flex-wrap gap-1">
                          {explanation.fusion_method.benefits.map((benefit: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                              {benefit}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quality Improvements */}
                  {explanation.quality_analysis && explanation.quality_analysis.improvements && (
                    <div className="mb-8">
                      <h5 className="text-white font-medium mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        Enhancement Metrics
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {renderQualityMetric(
                          'Sharpness',
                          explanation.quality_analysis.improvements.sharpness,
                          'Detail clarity improvement for damage identification'
                        )}
                        {renderQualityMetric(
                          'Contrast',
                          explanation.quality_analysis.improvements.contrast,
                          'Dynamic range enhancement for better visibility'
                        )}
                        {renderQualityMetric(
                          'Signal-to-Noise',
                          explanation.quality_analysis.improvements.signal_to_noise,
                          'Noise reduction while preserving important details'
                        )}
                        {explanation.quality_analysis.improvements.edge_definition && renderQualityMetric(
                          'Edge Definition',
                          explanation.quality_analysis.improvements.edge_definition,
                          'Structural boundary enhancement for damage assessment'
                        )}
                      </div>
                    </div>
                  )}

                  {/* Use Case Recommendations */}
                  {explanation.disaster_assessment_context && explanation.disaster_assessment_context.recommended_use_cases && (
                    <div className="mb-6">
                      <h5 className="text-white font-medium mb-4">Recommended Use Cases</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {explanation.disaster_assessment_context.recommended_use_cases.map((useCase: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{useCase}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {explanation.recommendations && explanation.recommendations.length > 0 && (
                    <div>
                      <h5 className="text-white font-medium mb-4">Expert Recommendations</h5>
                      <div className="space-y-3">
                        {explanation.recommendations.map((rec: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg border-l-4 border-blue-500">
                            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300 text-sm leading-relaxed">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 