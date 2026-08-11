import Link from "next/link";

const variants = {
  primary:
    "bg-bordeaux hover:bg-blood-light text-fog border border-blood/40 ritual-glow",
  ghost:
    "bg-transparent hover:bg-carbone/60 text-ash-light border border-ash/20",
  outline:
    "bg-transparent hover:bg-bordeaux/10 text-blood-light border border-blood/50",
};

export default function Button({
  children,
  href,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
}) {
  const classes = `inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-body text-sm tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}