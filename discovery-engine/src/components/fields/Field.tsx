"use client";

import { ReactNode } from "react";

export function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-8">
      <label className="mb-3 block font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-[var(--dossier-text)] md:text-xl">
        {label}
      </label>
      {hint && (
        <p className="mb-3 file-label !normal-case !tracking-normal text-[var(--dossier-text-faint)]">
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      required={required}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border-b-2 border-[var(--dossier-line-strong)] bg-transparent py-3 font-[family-name:var(--font-jetbrains-mono)] text-base text-[var(--dossier-text)] outline-none transition-colors placeholder:text-[var(--dossier-text-faint)] focus:border-[var(--dossier-red)]"
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full resize-none border-b-2 border-[var(--dossier-line-strong)] bg-transparent py-3 font-[family-name:var(--font-jetbrains-mono)] text-base text-[var(--dossier-text)] outline-none transition-colors placeholder:text-[var(--dossier-text-faint)] focus:border-[var(--dossier-red)]"
    />
  );
}

export function SingleSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`border px-4 py-2.5 text-sm transition-colors ${
            value === opt
              ? "border-[var(--dossier-red)] bg-[var(--dossier-red)] text-[#0a0a0a]"
              : "border-[var(--dossier-line-strong)] text-[var(--dossier-text)] hover:border-[var(--dossier-red)]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function MultiSelect({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options: readonly string[];
}) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  };
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`border px-4 py-2.5 text-sm transition-colors ${
            value.includes(opt)
              ? "border-[var(--dossier-red)] bg-[var(--dossier-red)] text-[#0a0a0a]"
              : "border-[var(--dossier-line-strong)] text-[var(--dossier-text)] hover:border-[var(--dossier-red)]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function YesNo({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: "Yes" | "No") => void;
}) {
  return <SingleSelect value={value} onChange={(v) => onChange(v as "Yes" | "No")} options={["Yes", "No"]} />;
}
