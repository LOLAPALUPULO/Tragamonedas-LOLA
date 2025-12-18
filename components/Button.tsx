
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'spin' | 'admin';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-bold text-white transition-all duration-200 shadow-md transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base';
  let variantStyles = '';

  switch (variant) {
    case 'primary':
      variantStyles = 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800';
      break;
    case 'secondary':
      variantStyles = 'bg-gray-700 hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800';
      break;
    case 'spin':
      // Changed to pulseRed and slotButton colors
      variantStyles = 'bg-slotButton hover:bg-slotButtonHover focus:ring-4 focus:ring-slotButtonActive focus:ring-offset-2 focus:ring-offset-gray-900 text-white text-xl md:text-2xl h-20 w-20 md:h-24 md:w-24 rounded-full flex items-center justify-center animate-pulseRed';
      break;
    case 'admin':
      variantStyles = 'bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800';
      break;
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;