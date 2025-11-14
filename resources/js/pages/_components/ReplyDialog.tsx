import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    username: string;
    avatar?: string;
    verified?: boolean;
}

interface Post {
    id: number;
    content: string;
    user: User;
}

interface ReplyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    post: Post;
    currentUser: User;
}

export function ReplyDialog({
    open,
    onOpenChange,
    post,
    currentUser,
}: ReplyDialogProps) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) return;

        setIsSubmitting(true);

        try {
            await axios.post(`/posts/${post.id}/replies`, {
                content: content.trim(),
            });

            // Close dialog and reset
            setContent('');
            onOpenChange(false);

            // Reload page to show new reply
            window.location.reload();
        } catch (error) {
            console.error('Error posting reply:', error);
            alert('Failed to post reply. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Reply</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Original Post */}
                    <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage
                                src={post.user.avatar}
                                alt={post.user.name}
                            />
                            <AvatarFallback>
                                {post.user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <div className="flex items-center gap-1">
                                <span className="font-bold">
                                    {post.user.name}
                                </span>
                                {post.user.verified && (
                                    <svg
                                        className="h-4 w-4 text-blue-500"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6 11.66l1.4-1.46 3.14 3.14 6.95-6.95L19 8.06l-8.46 8.14z" />
                                    </svg>
                                )}
                                <span className="text-sm text-muted-foreground">
                                    @{post.user.username}
                                </span>
                            </div>
                            <p className="mt-1 text-sm">{post.content}</p>
                        </div>
                    </div>

                    {/* Replying to indicator */}
                    <div className="ml-14 text-sm text-muted-foreground">
                        Replying to @{post.user.username}
                    </div>

                    {/* Reply Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={currentUser.avatar}
                                    alt={currentUser.name}
                                />
                                <AvatarFallback>
                                    {currentUser.name
                                        .substring(0, 2)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Post your reply"
                                className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0"
                                autoFocus
                                maxLength={280}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                {content.length}/280
                            </div>
                            <Button
                                type="submit"
                                disabled={!content.trim() || isSubmitting}
                                className="rounded-full"
                            >
                                {isSubmitting ? 'Replying...' : 'Reply'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
