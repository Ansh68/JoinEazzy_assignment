// Joins class names, skipping anything falsy: cn('p-2', isActive && 'bg-brand-50')
export const cn = (...classes) => classes.filter(Boolean).join(' ');
