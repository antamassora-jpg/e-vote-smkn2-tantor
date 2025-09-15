import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getInitials = (name: string): string => {
    if (!name) return '';

    const names = name.split('&').map(n => n.trim());
    
    if (names.length > 1 && names[0] && names[1]) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }

    const nameParts = names[0]?.split(' ') || [];
    if (nameParts.length > 1 && nameParts[0] && nameParts[nameParts.length - 1]) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    
    if (name) {
        return name.substring(0, 2).toUpperCase();
    }

    return '??';
};
