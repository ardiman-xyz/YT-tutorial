import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Send, Smile } from 'lucide-react';

interface MessageInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    disabled?: boolean;
}

export default function MessageInput({
    value,
    onChange,
    onSubmit,
    disabled = false,
}: MessageInputProps) {
    return (
        <div className="border-t p-4">
            <form onSubmit={onSubmit} className="flex items-end gap-2">
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                    >
                        <ImageIcon className="h-5 w-5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                    >
                        <Smile className="h-5 w-5" />
                    </Button>
                </div>

                <Input
                    type="text"
                    placeholder="Start a new message"
                    value={value}
                    onChange={onChange}
                    className="flex-1"
                />

                <Button
                    type="submit"
                    size="icon"
                    disabled={disabled || !value.trim()}
                    className="h-9 w-9 rounded-full"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
