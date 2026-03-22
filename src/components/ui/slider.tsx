"use client";

import { useCallback, useId } from "react";

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  formatValue,
  className = "",
}: SliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  const displayValue = formatValue ? formatValue(value) : String(value);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-sm font-semibold text-neutral-900">
            {label}
          </label>
          <span className="text-sm font-medium text-primary">{displayValue}</span>
        </div>
      )}

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="bouture-slider w-full cursor-pointer appearance-none"
        style={
          {
            "--slider-pct": `${pct}%`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
