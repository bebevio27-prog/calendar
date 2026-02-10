import { cn } from '../../lib/utils'

const variants = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  ghost: 'hover:bg-gray-100 text-gray-700',
}

export default function Button({
  children,
  variant = 'primary',
  className,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
