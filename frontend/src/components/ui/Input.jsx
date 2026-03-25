import React from 'react';

export default function Input({ label, type = 'text', id, ...props }) {
  return (
    <div className="relative mb-6">
      <div className="relative border border-gray-600 rounded-md focus-within:border-brand-blue bg-[#2c2c2c] transition duration-200">
        <input
          type={type}
          id={id}
          aria-label={label}
          className="block w-full px-4 py-3 bg-transparent text-white border-0 focus:ring-0 placeholder-gray-500 rounded-md outline-none"
          {...props}
        />
      </div>
    </div>
  );
}
