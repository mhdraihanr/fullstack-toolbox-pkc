"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({
    options,
    value,
    onValueChange,
    placeholder = "Select an option...",
    label,
    error,
    helperText,
    disabled = false,
    className,
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(option => option.value === value);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleSelect = (optionValue: string) => {
      onValueChange?.(optionValue);
      setIsOpen(false);
    };

    return (
      <div className={cn("space-y-2", className)} ref={ref}>
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <div className="relative" ref={selectRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus:ring-red-500",
              isOpen && "ring-2 ring-ring ring-offset-2"
            )}
          >
            <span className={cn(
              selectedOption ? "text-foreground" : "text-muted-foreground"
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )} />
          </button>
          
          {isOpen && (
            <div className="absolute top-full z-50 mt-1 w-full rounded-md border border-input bg-popover shadow-md">
              <div className="max-h-60 overflow-auto p-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                      value === option.value && "bg-accent text-accent-foreground"
                    )}
                  >
                    <span>{option.label}</span>
                    {value === option.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };