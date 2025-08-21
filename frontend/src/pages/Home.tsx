import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import { Bone as Drone, Zap, Shield, BarChart3, ArrowRight, Play } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleImageUpload = (file: File) => {
    setUploadedFile(file);
  };

  const handleAnalyzeClick = () => {
    if (uploadedFile) {
      navigate('/preprocessing');
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Enhancement',
      description: 'Advanced algorithms automatically enhance blurry and damaged drone imagery for clearer analysis.'
    },
    {
      icon: Shield,
      title: 'Damage Detection',
      description: 'Intelligent detection and classification of structural damage, debris, and hazardous areas.'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Instant analysis and reporting with severity classifications and impact assessments.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Drone className="w-12 h-12 text-blue-500" />
              <h1 className="text-5xl font-bold text-white">
                Disaster<span className="text-blue-500">Scope</span>
              </h1>
            </div>
            <p className="text-2xl text-gray-300 mb-4">AI-Powered Drone Disaster Analysis</p>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Transform blurry drone imagery into actionable intelligence. Our advanced AI system enhances 
              disaster footage, detects damage patterns, and provides real-time assessment for emergency response teams.
            </p>
          </div>

          {/* Upload Section */}
          <div className="max-w-3xl mx-auto mb-16">
            <ImageUpload 
              onImageUpload={handleImageUpload}
              className="mb-6"
            />
            
            {uploadedFile && (
              <div className="text-center">
                <button
                  onClick={handleAnalyzeClick}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                >
                  <Play className="w-5 h-5" />
                  <span>Analyze Image</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:transform hover:scale-105"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <feature.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Demo Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-8">Explore Demo Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <button
                onClick={() => navigate('/preprocessing')}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-xl p-6 text-center transition-all duration-200 group"
              >
                <div className="text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-200">
                  <Zap className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="text-white font-semibold mb-2">Image Enhancement</h3>
                <p className="text-gray-400 text-sm">See before/after comparison</p>
              </button>

              <button
                onClick={() => navigate('/mosaic')}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-xl p-6 text-center transition-all duration-200 group"
              >
                <div className="text-green-400 mb-3 group-hover:scale-110 transition-transform duration-200">
                  <Shield className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="text-white font-semibold mb-2">Damage Detection</h3>
                <p className="text-gray-400 text-sm">View detected damage areas</p>
              </button>

              <button
                onClick={() => navigate('/map')}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-xl p-6 text-center transition-all duration-200 group"
              >
                <div className="text-purple-400 mb-3 group-hover:scale-110 transition-transform duration-200">
                  <BarChart3 className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="text-white font-semibold mb-2">Interactive Map</h3>
                <p className="text-gray-400 text-sm">Explore disaster locations</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;