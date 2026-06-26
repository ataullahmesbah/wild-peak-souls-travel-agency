import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article';
  spacing?: 'default' | 'sm' | 'lg' | 'none';
}

const spacingMap = {
  none: '',
  sm: 'py-8 lg:py-12',
  default: 'py-16 lg:py-24',
  lg: 'py-24 lg:py-32',
};

export function Section({
  as: Component = 'section',
  spacing = 'default',
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Component className={cn(spacingMap[spacing], className)} {...props}>
      {children}
    </Component>
  );
}
