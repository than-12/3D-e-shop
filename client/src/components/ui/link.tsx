import React from 'react';
import { Link as WouterLink } from 'wouter';
import { cn } from '@/lib/utils';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
}

export function Link({
  href,
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}: LinkProps) {
  const isExternal = href.startsWith('http');
  
  const baseStyles = cn(
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
    {
      'text-primary underline-offset-4 hover:underline': variant === 'link',
      'text-sm': size === 'sm',
      'text-base': size === 'default',
      'text-lg': size === 'lg',
    },
    className
  );

  if (isExternal) {
    return (
      <a 
        href={href}
        className={baseStyles}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <WouterLink href={href}>
      <a className={baseStyles} {...props}>
        {children}
      </a>
    </WouterLink>
  );
} 