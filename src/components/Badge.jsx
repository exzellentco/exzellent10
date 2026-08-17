import * as React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

const Badge = React.forwardRef(({ className, children, ...props }, ref) => (
  <span ref={ref} className={twMerge(clsx("inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-text-secondary", className))} {...props}>
    {children}
  </span>
));
Badge.displayName = "Badge";
export default Badge; 