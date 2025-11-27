import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

interface InputFieldProps {
  label: string;
  name: string;
  value: number;
  onChange: (name: string, value: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  tooltip?: string;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  prefix, 
  suffix,
  min = 0,
  tooltip
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="mb-4 relative">
      <div className="flex items-center gap-2 mb-1">
        <label htmlFor={name} className="block text-sm font-semibold text-[#3f4142]">
          {label}
        </label>
        {tooltip && (
            <button 
              type="button"
              onClick={() => setShowTooltip(!showTooltip)}
              className={`rounded-full p-0.5 transition-colors ${showTooltip ? 'text-[#6958dd] bg-purple-50' : 'text-gray-400 hover:text-[#6958dd]'}`}
            >
                <Info size={14} />
            </button>
        )}
      </div>

      {/* Click-based Tooltip */}
      {showTooltip && tooltip && (
        <div className="absolute z-20 bottom-full left-0 mb-2 w-64 p-3 bg-[#3f4142] text-white text-xs rounded-lg shadow-xl animate-fade-in">
            <div className="flex justify-between items-start gap-2">
                <p className="leading-relaxed">{tooltip}</p>
                <button onClick={() => setShowTooltip(false)} className="text-gray-400 hover:text-white">
                    <X size={12} />
                </button>
            </div>
            <div className="absolute top-full left-4 border-4 border-transparent border-t-[#3f4142]"></div>
        </div>
      )}

      <div className="relative rounded-md shadow-sm">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          type="number"
          name={name}
          id={name}
          min={min}
          className={`block w-full rounded-md border-gray-300 py-2.5 focus:border-[#6958dd] focus:ring-[#6958dd] sm:text-sm border pl-${prefix ? '8' : '3'} pr-${suffix ? '8' : '3'} transition-colors`}
          placeholder="0"
          value={value || ''}
          onChange={(e) => onChange(name, parseFloat(e.target.value) || 0)}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;