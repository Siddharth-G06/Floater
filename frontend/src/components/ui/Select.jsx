import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({ label, id, options, ...props }) {
  return (
    <div className="relative mb-6">
      <div className="relative border border-gray-600 rounded-md focus-within:border-brand-blue bg-[#2c2c2c] transition duration-200 flex items-center pr-3">
        <select
          id={id}
          aria-label={label}
          className="block w-full px-4 py-3 bg-transparent text-white border-0 outline-none appearance-none cursor-pointer"
          {...props}
        >
          <option value="" disabled hidden>{label}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[#2c2c2c] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
