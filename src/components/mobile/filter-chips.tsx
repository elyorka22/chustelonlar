"use client";

interface FilterChipsProps {
  chips: { label: string; value: string }[];
  active?: string;
  onChange?: (value: string) => void;
}

export function FilterChips({ chips, active, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-1">
      {chips.map((chip) => {
        const isActive = active === chip.value;
        return (
          <button
            key={chip.value}
            type="button"
            onClick={() => onChange?.(chip.value)}
            className={`flex-shrink-0 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
              isActive
                ? "bg-primary text-white shadow-md shadow-primary/25"
                : "bg-secondary text-gray-600"
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}
