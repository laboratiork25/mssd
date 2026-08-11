export default function Card({ children, className = "" }) {
  return (
    <div className={`ritual-card p-6 ${className}`}>{children}</div>
  );
}