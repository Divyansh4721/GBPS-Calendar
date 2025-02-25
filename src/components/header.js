import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Youtube } from 'lucide-react';
const Header = ({ children }) => {
  const navigate = useNavigate();
  
  // Determine if the header should be slim (no children)
  const isSlim = !children;
  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 shadow-lg relative">
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex space-x-2 z-20">
        <button
          onClick={() => navigate("/youtube")}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-1 sm:p-1 rounded-full transition-all duration-300 shadow-lg"
          title="YouTube Channel"
          aria-label="YouTube Channel"
        >
          <Youtube size={20} color="white" />
        </button>
        <button
          onClick={() => navigate("/upload")}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-1 sm:p-1 rounded-full transition-all duration-300 shadow-lg"
          title="Upload Calendar"
          aria-label="Upload Calendar"
        >
          <Upload size={20} color="white" />
        </button>
      </div>
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 ${isSlim ? 'py-2 sm:py-3 md:py-4' : 'py-4 sm:py-6 md:py-8'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="relative">
              <img
                className={`${isSlim ? 'h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24' : 'h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28'} relative z-10 p-1 rounded-full cursor-pointer`}
                src="/GBPS-Calendar/logo.png"
                alt="GBPS Trust Logo"
                onClick={() => navigate("/")}
              />
            </div>
            <div className="text-center md:text-left mt-2 md:mt-0">
              <h1 className={`${isSlim ? 'text-xl sm:text-2xl md:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-bold text-white drop-shadow-md ${isSlim ? 'mb-0' : 'mb-2'}`}>
                GBPS Trust Vrindavan
              </h1>
              {children}
            </div>
          </div>
          <div className={`${isSlim ? 'hidden lg:block' : 'hidden lg:block'}`}>
            <div className="bg-gradient-to-r from-purple-700/70 to-pink-700/70 backdrop-blur-sm px-6 py-3 rounded-xl text-center">
              <p className="text-white text-lg font-medium">
                Serving the Vaishnava Community
              </p>
              <div className="mt-1 h-0.5 w-24 mx-auto bg-gradient-to-r from-yellow-200 to-yellow-400"></div>
            </div>
          </div>
        </div>
      </div>
      <div className={`${isSlim ? 'h-0.5 sm:h-1' : 'h-1 sm:h-2'} bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400`}></div>
    </div>
  );
};
export default Header;