import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { User } from '@/types/post';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useState } from 'react';

interface SuggestedUser {
    id: number;
    name: string;
    username: string;
    avatar?: string;
    is_verified: boolean;
    is_following: boolean;
}

export default function NewMessage() {
    const { auth, suggested_users } = usePage<any>().props as {
        auth: { user: User };
        suggested_users: SuggestedUser[];
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SuggestedUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<SuggestedUser | null>(
        null,
    );
    const [isSearching, setIsSearching] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        recipient_id: '',
        message: '',
    });

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);

        try {
            const response = await axios.get('/messages/search-users', {
                params: { q: query },
            });
            setSearchResults(response.data.users);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectUser = (user: SuggestedUser) => {
        setSelectedUser(user);
        setData('recipient_id', user.id.toString());
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/messages/conversation');
    };

    const displayedUsers =
        searchQuery.trim().length >= 2 ? searchResults : suggested_users;

    return (
        <AppLayout isRightSidebarOpen={false}>
            <Head title="New Message" />

            <div className="mx-auto max-w-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b bg-background p-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit('/messages')}
                            className="h-9 w-9"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-bold">New Message</h1>
                    </div>
                </div>

                {/* Selected User */}
                {selectedUser && (
                    <div className="border-b p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage
                                        src={selectedUser.avatar}
                                        alt={selectedUser.name}
                                    />
                                    <AvatarFallback>
                                        {selectedUser.name
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold">
                                            {selectedUser.name}
                                        </span>
                                        {selectedUser.is_verified && (
                                            <svg
                                                className="h-4 w-4 text-blue-500"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6 11.66l1.4-1.46 3.14 3.14 6.95-6.95L19 8.06l-8.46 8.14z" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        @{selectedUser.username}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setSelectedUser(null);
                                    setData('recipient_id', '');
                                }}
                                className="h-8 w-8"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Search or Message Input */}
                {!selectedUser ? (
                    <>
                        {/* Search */}
                        <div className="border-b p-4">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search people"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    className="pl-10"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* User List */}
                        <div className="overflow-y-auto">
                            {isSearching ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    Searching...
                                </div>
                            ) : displayedUsers.length > 0 ? (
                                <>
                                    {searchQuery.trim().length < 2 && (
                                        <div className="border-b bg-muted/30 p-3">
                                            <h3 className="text-sm font-semibold">
                                                Suggested
                                            </h3>
                                        </div>
                                    )}
                                    {displayedUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() =>
                                                handleSelectUser(user)
                                            }
                                            className="flex cursor-pointer items-center gap-3 border-b p-4 transition-colors hover:bg-muted/50"
                                        >
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage
                                                    src={user.avatar}
                                                    alt={user.name}
                                                />
                                                <AvatarFallback>
                                                    {user.name
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-bold">
                                                        {user.name}
                                                    </span>
                                                    {user.is_verified && (
                                                        <svg
                                                            className="h-4 w-4 text-blue-500"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                        >
                                                            <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6 11.66l1.4-1.46 3.14 3.14 6.95-6.95L19 8.06l-8.46 8.14z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    @{user.username}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    {searchQuery.trim().length >= 2
                                        ? 'No users found'
                                        : 'No suggested users'}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <div className="flex-1 p-4">
                            <Textarea
                                value={data.message}
                                onChange={(e) =>
                                    setData('message', e.target.value)
                                }
                                placeholder="Start a message..."
                                className="min-h-[200px] resize-none border-0 p-0 focus-visible:ring-0"
                                autoFocus
                                maxLength={1000}
                            />
                            {errors.message && (
                                <p className="mt-2 text-sm text-destructive">
                                    {errors.message}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between border-t p-4">
                            <div className="text-sm text-muted-foreground">
                                {data.message.length}/1000
                            </div>
                            <Button
                                type="submit"
                                disabled={!data.message.trim() || processing}
                                className="rounded-full"
                            >
                                {processing ? 'Sending...' : 'Send'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </AppLayout>
    );
}
