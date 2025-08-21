import React, { useState, useEffect } from 'react';
import LeafletMap from '../components/LeafletMap';
import LoadingSpinner from '../components/LoadingSpinner';
import { Download, Filter, RefreshCw, MapPin } from 'lucide-react';
import { mapMarkers } from '../data/dummyData';

const Map: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const severityOptions = ['all', 'critical', 'high', 'medium', 'low'];
  
  const filteredMarkers = selectedSeverity === 'all' 
    ? mapMarkers 
    : mapMarkers.filter(marker => marker.severity === selectedSeverity);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Interactive Map</h2>
          <p className="text-gray-400">Preparing satellite imagery and damage markers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">Interactive Disaster Map</h1>
              <p className="text-gray-400">Real-time visualization of damage assessment markers</p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {severityOptions.map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)} Severity
                    </option>
                  ))}
                </select>
              </div>
              
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">
                  {filteredMarkers.length} markers displayed
                </span>
              </div>
              
              <div className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="mb-8">
          <LeafletMap />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-red-400">
              {mapMarkers.filter(m => m.severity === 'critical').length}
            </div>
            <div className="text-sm text-gray-400">Critical Sites</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-orange-400">
              {mapMarkers.filter(m => m.severity === 'high').length}
            </div>
            <div className="text-sm text-gray-400">High Priority</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-yellow-400">
              {mapMarkers.filter(m => m.severity === 'medium').length}
            </div>
            <div className="text-sm text-gray-400">Medium Priority</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">
              {mapMarkers.filter(m => m.severity === 'low').length}
            </div>
            <div className="text-sm text-gray-400">Low Priority</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;