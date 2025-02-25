import React from 'react';
import { Upload } from 'lucide-react';
const Header = () => (
  <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 shadow-lg relative">
    <a 
      href="/GBPS-Calendar/upload" 
      className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-1 rounded-full transition-all duration-300 shadow-lg z-20"
      title="Upload Calendar"
    >
      <Upload size={20} color="white" />
    </a>
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-white rounded-full blur-md opacity-20"></div>
            <img
              className="h-28 w-28 relative z-10 p-1 rounded-full border-2 border-yellow-200"
              src='logo.png'
              alt="GBPS Trust Logo"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-white drop-shadow-md mb-2">
              GBPS Trust Vrindavan
            </h1>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-2xl text-yellow-100 font-medium">
                श्री गौड़ीय वैष्णव व्रतोत्सव तालिका
              </p>
              <p className="text-xl text-yellow-100">
                श्री गौराब्द - 539 एवं विक्रमी सम्वत् 2082
              </p>
            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="bg-gradient-to-r from-purple-700/70 to-pink-700/70 backdrop-blur-sm px-6 py-3 rounded-xl text-center">
            <p className="text-white text-lg font-medium">
              Serving the Vaishnava Community
            </p>
            <div className="mt-1 h-0.5 w-24 mx-auto bg-gradient-to-r from-yellow-200 to-yellow-400"></div>
          </div>
        </div>
      </div>
    </div>
    <div className="h-2 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"></div>
  </div>
);
export default Header;