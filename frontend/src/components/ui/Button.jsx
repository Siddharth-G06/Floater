import React from 'react';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = "w-full py-3 px-4 rounded-md font-semibold transition duration-200 uppercase tracking-wide text-sm";
  const variants = {
    primary: "bg-[#0bb2ff] hover:bg-[#009bf2] text-white shadow-md",
    secondary: "bg-transparent hover:bg-white/10 text-white border border-white/20"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
