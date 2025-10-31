import { useEffect, useRef } from 'react';

export function useAutoResizeTextarea(content: string) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [content]);

    return textareaRef;
}

export function useCharacterCounter(content: string, maxLength: number) {
    const remaining = maxLength - content.length;
    const percentage = Math.min((content.length / maxLength) * 100, 100);

    const getStrokeColor = () => {
        if (remaining < 0) return 'rgb(239 68 68)'; // red-500
        if (remaining < 20) return 'rgb(245 158 11)'; // amber-500
        return 'rgb(59 130 246)'; // blue-500
    };

    return {
        remaining,
        percentage,
        strokeColor: getStrokeColor(),
        isOverLimit: remaining < 0,
    };
}
