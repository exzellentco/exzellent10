import * as React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

const base = "inline-flex items-center justify-center rounded-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
const variants = {
  default: "bg-purple-600 text-white hover:bg-purple-700",
  outline: "border border-slate-300 bg-white text-text-secondary hover:bg-slate-100",
};
const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-8 py-3 text-lg",
};

const Button = React.forwardRef(({ className, variant = "default", size = "md", ...props }, ref) => (
  <button ref={ref} className={twMerge(clsx(base, variants[variant], sizes[size], className))} {...props}/>
));
Button.displayName = "Button";
export default Button; 