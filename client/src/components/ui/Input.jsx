import { forwardRef } from "react";
import { clsx } from "clsx";

const Input = forwardRef(({ label, error, icon, rightElement, className = "", ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</span>}
      <input
        ref={ref}
        className={clsx(
          "input-base",
          icon && "pl-10",
          rightElement && "pr-10",
          error && "border-danger focus:border-danger focus:ring-danger",
          className
        )}
        {...props}
      />
      {rightElement && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</span>
      )}
    </div>
    {error && <p className="text-xs text-danger">{error}</p>}
  </div>
));

Input.displayName = "Input";
export default Input;
