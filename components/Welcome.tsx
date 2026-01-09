import React from 'react';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

interface WelcomeProps {
  onStart: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn relative overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-50 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="relative z-10 max-w-2xl flex flex-col items-center">
        <div className="mb-8 relative">
            <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-500 rotate-3 shadow-lg mb-2">
                <Sparkles size={40} strokeWidth={1.5} />
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full shadow-sm animate-bounce">
                <Star size={16} fill="currentColor" />
            </div>
        </div>

        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
          Configurador EGEA de Cortinas Express
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 mb-14 md:mb-20 leading-relaxed font-medium">
          La manera mas rapida, economica y efectiva de renovar tus cortinas para esta temporada.
        </p>

        <button
          onClick={onStart}
          className="group relative bg-gray-900 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 hover:shadow-2xl hover:bg-black transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3 mb-12"
        >
          <span>Comencemos</span>
          <div className="bg-white/20 p-1 rounded-full group-hover:translate-x-1 transition-transform">
             <ArrowRight size={20} />
          </div>
        </button>

        {/* Logo Egea */}
        <div className="mb-8">
            <img 
              src="/image/egea-logo.png" 
              alt="Logo EGEA" 
              className="h-16 md:h-20 object-contain"
            />
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm text-gray-400 font-medium uppercase tracking-widest">
            <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Sin compromiso
            </div>
            <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                Exclusivo para profesionales
            </div>
            <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                100% Online
            </div>
        </div>
      </div>
    </div>
  );
};
