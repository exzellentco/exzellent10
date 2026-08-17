import { Link } from "react-router-dom";

export default function ActionButton({
  buttons,
  className = "flex flex-col md:flex-row gap-4 justify-center align-center w-full",
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl border-2 font-semibold text-lg transition-all duration-300 whitespace-nowrap w-[80vw] sm:w-[100%] md:w-auto md:flex-1 min-w-0"

  const variants = {
    default:
      "border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white backdrop-blur-sm",
    secondary:
      "border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-black backdrop-blur-sm",
    outline:
      "border-[var(--color-tertiary)] text-[var(--color-tertiary)] hover:bg-[var(--color-tertiary)] hover:text-black backdrop-blur-sm",
  };

  return (
    <section className={className}>
      {buttons.map((btn, idx) => (
        <Link
          key={idx}
          to={btn.href || "#"}
          onClick={btn.onClick}
          className={`${baseStyles} ${variants[btn.variant || "default"]} ${btn.className || ""}`}
        >
          {btn.icon && (
            <span className="shrink-0 flex items-center w-5 h-5">
              {btn.icon}
            </span>
          )}
          <span className="flex items-center">{btn.text}</span>
        </Link>
      ))}
    </section>
  );
}
