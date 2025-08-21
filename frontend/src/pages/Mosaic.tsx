import React, { useState, useEffect } from 'react';
import MosaicMap from '../components/MosaicMap';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowRight, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { boundingBoxes } from '../data/dummyData';

const Mosaic: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate stitching process
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const severityCounts = {
    critical: boundingBoxes.filter(b => b.severity === 'critical').length,
    high: boundingBoxes.filter(b => b.severity === 'high').length,
    medium: boundingBoxes.filter(b => b.severity === 'medium').length,
    low: boundingBoxes.filter(b => b.severity === 'low').length,
  };

  const totalDamage = Object.values(severityCounts).reduce((a, b) => a + b, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Creating Mosaic Map</h2>
          <p className="text-gray-400">Stitching drone images and detecting damage patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Damage Assessment Overview</h1>
          <p className="text-gray-400">Comprehensive analysis of the affected area with AI-detected damage markers</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-400 font-medium">Critical</span>
            </div>
            <div className="text-2xl font-bold text-white">{severityCounts.critical}</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="text-orange-400 font-medium">High</span>
            </div>
            <div className="text-2xl font-bold text-white">{severityCounts.high}</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-400 font-medium">Medium</span>
            </div>
            <div className="text-2xl font-bold text-white">{severityCounts.medium}</div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-green-500" />
              <span className="text-green-400 font-medium">Low</span>
            </div>
            <div className="text-2xl font-bold text-white">{severityCounts.low}</div>
          </div>
        </div>

        {/* Mosaic Map Component */}
        <div className="mb-8">
          <MosaicMap />
        </div>

        {/* Analysis Summary */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Assessment Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <h4 className="text-white font-medium mb-1">Coverage Area</h4>
                <p className="text-gray-400 text-sm">2.4 km² analyzed with 98% image overlap</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 mt-1" />
              <div>
                <h4 className="text-white font-medium mb-1">Total Detections</h4>
                <p className="text-gray-400 text-sm">{totalDamage} damage sites identified with 94% confidence</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-green-400 mt-1" />
              <div>
                <h4 className="text-white font-medium mb-1">Processing Time</h4>
                <p className="text-gray-400 text-sm">Analysis completed in 1.8 minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/preprocessing')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Back to Enhancement
          </button>
          
          <button
            onClick={() => navigate('/map')}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <span>View Interactive Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Mosaic;