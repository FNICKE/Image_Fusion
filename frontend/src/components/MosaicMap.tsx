import React, { useState } from 'react';
import { boundingBoxes, severityColors } from '../data/dummyData';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';

const MosaicMap: React.FC = () => {
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [selectedBox, setSelectedBox] = useState<number | null>(null);

  const getSeverityIcon = (severity: string) => {
    return <AlertTriangle className="w-4 h-4" style={{ color: severityColors[severity as keyof typeof severityColors] }} />;
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Stitched Mosaic Map</h3>
            <p className="text-sm text-gray-400">Drone imagery analysis with damage detection</p>
          </div>
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            {showBoundingBoxes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="text-sm">Toggle Overlays</span>
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Mosaic Image */}
        <img
          src="https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg"
          alt="Stitched Mosaic Map"
          className="w-full h-96 object-cover"
        />
        
        {/* Bounding Boxes Overlay */}
        {showBoundingBoxes && (
          <div className="absolute inset-0">
            {boundingBoxes.map((box) => (
              <div
                key={box.id}
                className={`absolute border-2 cursor-pointer transition-all duration-200 ${
                  selectedBox === box.id 
                    ? 'border-white shadow-lg' 
                    : 'border-current hover:border-white/80'
                }`}
                style={{
                  left: `${(box.x / 1000) * 100}%`,
                  top: `${(box.y / 600) * 100}%`,
                  width: `${(box.w / 1000) * 100}%`,
                  height: `${(box.h / 600) * 100}%`,
                  borderColor: severityColors[box.severity as keyof typeof severityColors],
                  backgroundColor: `${severityColors[box.severity as keyof typeof severityColors]}20`
                }}
                onClick={() => setSelectedBox(selectedBox === box.id ? null : box.id)}
              >
                {/* Label */}
                <div 
                  className="absolute -top-8 left-0 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
                  style={{ backgroundColor: severityColors[box.severity as keyof typeof severityColors] }}
                >
                  {box.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detection Results */}
      <div className="p-4 border-t border-gray-700">
        <h4 className="text-white font-medium mb-3">Detected Damage ({boundingBoxes.length} items)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {boundingBoxes.map((box) => (
            <div
              key={box.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedBox === box.id
                  ? 'bg-gray-600 border-white'
                  : 'bg-gray-700 border-gray-600 hover:border-gray-500'
              }`}
              onClick={() => setSelectedBox(selectedBox === box.id ? null : box.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium text-sm">{box.label}</span>
                {getSeverityIcon(box.severity)}
              </div>
              <div className="text-xs text-gray-400">
                <div>Position: ({box.x}, {box.y})</div>
                <div>Size: {box.w} × {box.h}</div>
                <div className="capitalize">Severity: {box.severity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MosaicMap;