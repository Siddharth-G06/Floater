import React from 'react';

export default function Input({ label, type = 'text', id, ...props }) {
  return (
    <div className="flex flex-col mb-5">
      {label && (
        <label htmlFor={id} className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2 ml-1">
          {label}
        </label>
      )}
      <div className="relative border border-white/10 rounded-xl focus-within:border-brand-blue bg-[#252525] transition-all duration-200 shadow-sm">
        <input
          type={type}
          id={id}
          className="block w-full px-4 py-3.5 bg-transparent text-white border-0 focus:ring-0 placeholder-gray-600 rounded-xl outline-none text-sm sm:text-base font-medium"
          {...props}
        />
      </div>
    </div>
  );
}
