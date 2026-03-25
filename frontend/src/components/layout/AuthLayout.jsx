import React from 'react';

export default function AuthLayout({ children, headerAction }) {
  return (
    <div className="min-h-screen bg-[#121212] p-4 lg:p-8 flex items-center justify-center font-sans">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl rounded-[2rem] overflow-hidden shadow-2xl animate-fade-in">
        
        {/* Left Side (Gradient Section) */}
        <div className="bg-gradient-to-br from-[#0066ff] to-[#003d99] text-white w-full lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center relative min-h-[500px] overflow-hidden">
          {/* Subtle background decorative shapes */}
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="text-center z-10 w-full mb-16 mt-8">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-wide drop-shadow-md">
              Keeps your business <br/>
              <span className="text-[#bbf7d0]">FLOATING</span>
            </h1>
          </div>


        </div>

        {/* Right Side (Form Section) */}
        <div className="bg-[#1e1e1e] w-full lg:w-1/2 p-10 lg:p-16 flex flex-col relative">
          {headerAction && (
            <div className="absolute top-6 right-8 lg:top-10 lg:right-16 z-10">
              {headerAction}
            </div>
          )}
          <div className="flex-1 flex flex-col justify-center mt-12 lg:mt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
