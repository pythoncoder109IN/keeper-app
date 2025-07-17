import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const buttonVariants = {
  default: "btn-primary",
  destructive: "btn-destructive", 
  outline: "btn-outline",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  link: "text-primary underline-offset-4 hover:underline"
};

const buttonSizes = {
  default: "h-12 px-6 py-3",
  sm: "h-9 px-4 py-2 text-xs",
  lg: "h-14 px-8 py-4 text-base",
  icon: "h-12 w-12"
};

const Button = forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  loading = false,
  children, 
  ...props 
}, ref) => {
  const Component = motion.button;
  
  return (
    <Component
      ref={ref}
      className={cn(
        buttonVariants[variant],
        buttonSizes[size],
        loading && "pointer-events-none opacity-50",
        className
      )}
      disabled={loading || props.disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Component>
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };