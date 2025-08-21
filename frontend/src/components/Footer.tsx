import React from 'react';
import { Bone as Drone, Github, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Drone className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-bold text-white">DisasterScope</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Advanced AI-powered drone image analysis for disaster response and damage assessment.
              Helping emergency responders make informed decisions faster.
            </p>
            <div className="flex space-x-3">
              <Github className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" herf="https://github.com/FNICKE/Image_Fusion"/>
              <Mail className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <MapPin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer transition-colors">Image Enhancement</li>
              <li className="hover:text-white cursor-pointer transition-colors">Damage Detection</li>
              <li className="hover:text-white cursor-pointer transition-colors">Mosaic Stitching</li>
              <li className="hover:text-white cursor-pointer transition-colors">Interactive Maps</li>
              <li className="hover:text-white cursor-pointer transition-colors">Real-time Analysis</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Technology</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer transition-colors">React + TypeScript</li>
              <li className="hover:text-white cursor-pointer transition-colors">Tailwind CSS</li>
              <li className="hover:text-white cursor-pointer transition-colors">Leaflet Maps</li>
              <li className="hover:text-white cursor-pointer transition-colors">Computer Vision</li>
              <li className="hover:text-white cursor-pointer transition-colors">Machine Learning</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 DisasterScope - Image Fusion. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Built for emergency response and disaster management
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;