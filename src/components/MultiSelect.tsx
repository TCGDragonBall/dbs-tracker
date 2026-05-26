import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}

export function MultiSelect({ options, values, onChange, placeholder = 'Select items...', searchPlaceholder = '...' }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    const newValues = values.includes(value)
      ? values.filter(v => v !== value)
      : [...values, value];
    onChange(newValues);
    setSearchTerm(''); 
    // keep it open so user can select more
  };

  const removeValue = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onChange(values.filter(v => v !== value));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && searchTerm === '' && values.length > 0) {
      onChange(values.slice(0, -1));
    }
    if (e.key === 'Enter' && searchTerm !== '') {
      const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredOptions.length > 0 && !values.includes(filteredOptions[0].value)) {
        toggleOption(filteredOptions[0].value);
      }
    }
  };

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className={`min-h-[42px] border bg-white/5 rounded-xl px-2 py-1.5 flex flex-wrap gap-1.5 items-center cursor-text transition-colors ${isOpen ? 'border-orange-500/50' : 'border-white/10 hover:border-white/20'}`}
        onClick={() => setIsOpen(true)}
      >
        {values.map(val => {
          const option = options.find(o => o.value === val);
          return (
            <span key={val} className="flex items-center gap-1 bg-white/10 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1.5 rounded-md border border-white/10">
              {option ? option.label : val}
              <X size={12} className="cursor-pointer hover:text-red-400" onClick={(e) => removeValue(e, val)} />
            </span>
          );
        })}
        <input
          type="text"
          className="flex-1 min-w-[60px] bg-transparent text-white text-xs outline-none px-1"
          placeholder={values.length === 0 ? placeholder : searchPlaceholder}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
        />
        <div 
           className="ml-auto w-6 flex justify-center cursor-pointer opacity-50 hover:opacity-100"
           onClick={(e) => {
             e.stopPropagation();
             setIsOpen(!isOpen);
           }}
        >
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1a1c23] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-500">No results found</div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = values.includes(opt.value);
                return (
                  <div 
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`flex items-center justify-between px-3 py-2.5 my-0.5 rounded-lg text-xs cursor-pointer transition-colors ${isSelected ? 'bg-orange-500/20 text-orange-400 font-bold' : 'text-gray-300 hover:bg-white/5'}`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
