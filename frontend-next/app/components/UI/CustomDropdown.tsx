import React, { useState, useRef, useEffect } from "react";

interface Option {
  _id: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  searchable?: boolean;
  disabled?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option",
  name,
  required = false,
  searchable = false,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const selected = options.find((o) => o._id === value);

  return (
    <div className="relative" ref={ref}>
      {name && (
        <input type="hidden" name={name} value={value} required={required} />
      )}
      <div
        className={`w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green focus:outline-none text-black cursor-pointer flex items-center justify-between ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        tabIndex={0}
      >
        <span>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-ivory border border-racing-green/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchable && (
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full p-2 border-b border-racing-green/10 bg-ivory text-black rounded-t-lg focus:outline-none"
            />
          )}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">No options found</div>
            )}
            {filtered.map((o) => (
              <div
                key={o._id}
                className={`p-3 cursor-pointer hover:bg-racing-green/10 ${value === o._id ? "bg-racing-green/10 font-semibold" : ""}`}
                onClick={() => {
                  onChange(o._id);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {o.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;

