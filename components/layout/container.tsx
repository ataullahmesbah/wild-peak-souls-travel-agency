import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'max-w-3xl',
  default: 'max-w-7xl',
  lg: 'max-w-6xl',
  xl: 'max-w-4xl',
};

export function Container({
  size = 'default',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizeMap[size],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
