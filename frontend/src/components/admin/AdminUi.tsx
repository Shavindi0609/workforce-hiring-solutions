import type { ReactNode } from "react";

type AdminPanelProps = {
  children: ReactNode;
  className?: string;
};

type AdminButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
};

type FilterSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

type DateRangeInputProps = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

export const AdminPanel = ({ children, className = "" }: AdminPanelProps) => (
  <section className={`admin-panel ${className}`.trim()}>{children}</section>
);

export const AdminButton = ({ children, disabled = false, icon, onClick }: AdminButtonProps) => (
  <button className="admin-button" type="button" disabled={disabled} onClick={onClick}>
    {icon}
    <span>{children}</span>
  </button>
);

export const FilterSelect = ({ label, value, options, onChange }: FilterSelectProps) => (
  <label className="filter-control">
    <span>{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

export const DateRangeInput = ({ from, to, onFromChange, onToChange }: DateRangeInputProps) => (
  <div className="date-range-input">
    <label>
      <span>From</span>
      <input type="date" value={from} onChange={(event) => onFromChange(event.target.value)} />
    </label>
    <label>
      <span>To</span>
      <input type="date" value={to} min={from || undefined} onChange={(event) => onToChange(event.target.value)} />
    </label>
  </div>
);
