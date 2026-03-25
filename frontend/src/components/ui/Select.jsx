import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({ label, id, options, ...props }) {
  return (
    <div className="flex flex-col mb-5">
      {label && (
        <label htmlFor={id} className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2 ml-1">
          {label}
        </label>
      )}
      <div className="relative border border-white/10 rounded-xl focus-within:border-brand-blue bg-[#252525] transition-all duration-200 shadow-sm flex items-center pr-3">
        <select
          id={id}
          className="block w-full px-4 py-3.5 bg-transparent text-white border-0 outline-none appearance-none cursor-pointer text-sm sm:text-base font-medium"
          {...props}
        >
          <option value="" disabled hidden>{label}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[#1e1e1e] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-5 h-5 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}
