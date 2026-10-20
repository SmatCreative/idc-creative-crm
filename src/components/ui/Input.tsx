import { cn } from '@/lib/utils/cn';
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';

const baseInput = 'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(baseInput, className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(baseInput, 'resize-none', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(baseInput, 'cursor-pointer', className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function Label({ children, htmlFor, className }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={cn('block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5', className)}>
      {children}
    </label>
  );
}

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function FormGroup({ children, className }: FormGroupProps) {
  return <div className={cn('space-y-1', className)}>{children}</div>;
}
