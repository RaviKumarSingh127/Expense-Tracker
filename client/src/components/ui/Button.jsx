import { motion } from "framer-motion";
import { clsx } from "clsx";

const variants = {
  primary: "bg-primary hover:bg-primary-hover text-white shadow-glow hover:shadow-glow",
  ghost: "bg-transparent hover:bg-surface-2 text-text-primary border border-border",
  danger: "bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30",
  accent: "bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30",
  subtle: "bg-surface-2 hover:bg-border text-text-primary",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
  icon: "p-2.5 rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={clsx(
        "font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
