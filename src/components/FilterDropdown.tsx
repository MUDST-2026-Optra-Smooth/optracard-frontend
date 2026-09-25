import { useEffect, useRef, useState } from 'react';

export interface DropdownOption {
  label: string;
  value: string;
  shortLabel?: string;
}

interface FilterDropdownProps {
  label: string;
  options: DropdownOption[];
  selected: DropdownOption;
  onSelect: (option: DropdownOption) => void;
  align?: 'left' | 'right';
}

export const FilterDropdown = ({ label, options, selected, onSelect, align = 'left' }: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="border rounded-md px-4 py-2 text-sm text-gray-700 bg-white flex items-center gap-2"
      >
        {label} {selected.shortLabel ?? selected.label}
        <span className="text-gray-400">▾</span>
      </button>

      {isOpen && (
        <div
          className={`absolute mt-1 w-52 bg-white border rounded-md shadow-lg z-10 py-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                option.value === selected.value ? 'text-blue-600 font-medium' : 'text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};