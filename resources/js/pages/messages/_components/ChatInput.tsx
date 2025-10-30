import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image as ImageIcon, Send, Smile } from 'lucide-react';

export default function ChatInput({
    message,
    onChange,
    onSend,
}: {
    message: string;
    onChange: (v: string) => void;
    onSend: () => void;
}) {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSend();
            }}
            className="flex items-end gap-2 border-t p-4"
        >
            <div className="flex gap-2">
                <Button type="button" variant="ghost" size="icon">
                    <ImageIcon className="h-5 w-5" />
                </Button>
                <Button type="button" variant="ghost" size="icon">
                    <Smile className="h-5 w-5" />
                </Button>
            </div>
            <Input
                placeholder="Start a new message"
                value={message}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1"
            />
            <Button
                type="submit"
                size="icon"
                disabled={!message.trim()}
                className="h-9 w-9 rounded-full"
            >
                <Send className="h-4 w-4" />
            </Button>
        </form>
    );
}
