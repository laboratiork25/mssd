export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="text-sm text-ash-light font-body">
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="bg-carbone/70 border border-ash/20 focus:border-blood-light rounded-md px-4 py-2.5 text-fog outline-none transition-all duration-300"
      >
        <option value="" disabled>
          Seleziona...
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}