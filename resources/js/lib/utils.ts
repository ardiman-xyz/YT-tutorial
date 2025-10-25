import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatNumber = (n: number) =>
    n >= 1_000_000
        ? (n / 1_000_000).toFixed(1) + 'M'
        : n >= 1_000
          ? (n / 1_000).toFixed(1) + 'K'
          : n.toString();
