export default function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} className="text-sm text-ash-light font-body">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="bg-carbone/70 border border-ash/20 focus:border-blood-light focus:ritual-glow rounded-md px-4 py-2.5 text-fog placeholder:text-ash/50 outline-none transition-all duration-300"
      />
      {error && <span className="text-xs text-blood-light">{error}</span>}
    </div>
  );
}