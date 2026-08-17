import * as React from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

const Card = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={twMerge(clsx("bg-white rounded-2xl shadow p-6", className))} {...props}>{children}</div>
));
Card.displayName = "Card";
export default Card; 