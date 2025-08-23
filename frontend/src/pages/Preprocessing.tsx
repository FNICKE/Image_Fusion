import React, { useState, useEffect } from 'react';
import ComparisonSlider from '../components/ComparisonSlider';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowRight, Download, Share, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Preprocessing: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate processing time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Enhancement Quality', value: '94%', color: 'text-green-400' },
    { label: 'Noise Reduction', value: '87%', color: 'text-blue-400' },
    { label: 'Clarity Improvement', value: '91%', color: 'text-purple-400' },
    { label: 'Processing Time', value: '2.1s', color: 'text-yellow-400' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Enhancing Your Image</h2>
          <p className="text-gray-400">Applying AI-powered preprocessing algorithms...</p>
          <div className="mt-8 space-y-2 text-left">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Noise reduction applied</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Contrast enhancement</span>
            </div>
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" className="text-blue-400" />
              <span className="text-gray-300">Sharpening filters...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Image Enhancement Results</h1>
          <p className="text-gray-400">Compare the original blurry image with our AI-enhanced version</p>
        </div>

        {/* Comparison Slider */}
        <div className="mb-8">
          <ComparisonSlider
            beforeImage=""
            afterImage=""
            beforeLabel="Original (Blurry)"
            afterLabel="AI-Enhanced (Clear)"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className={`text-3xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Enhancement Details */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Enhancement Techniques Applied</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">Noise Reduction</h4>
              <p className="text-gray-400 text-sm mb-4">
                Advanced denoising algorithms removed atmospheric interference and sensor noise while preserving critical details.
              </p>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Signal-to-Noise Ratio</span>
                  <span className="text-green-400">+87%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full w-[87%]"></div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Sharpness Enhancement</h4>
              <p className="text-gray-400 text-sm mb-4">
                Edge detection and sharpening filters improved structural definition and object boundaries.
              </p>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">Edge Definition</span>
                  <span className="text-blue-400">+91%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full w-[91%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download Enhanced</span>
          </button>
          
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
            <Share className="w-4 h-4" />
            <span>Share Results</span>
          </button>
          
          <button
            onClick={() => navigate('/mosaic')}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <span>Analyze Damage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preprocessing;