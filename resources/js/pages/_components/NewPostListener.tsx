// components/NewPostListener.tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { useState } from 'react';

type NewPostData = {
    message: string;
    post: {
        id: number;
        content: string;
        user: {
            id: number;
            name: string;
            username: string;
            avatar: string;
        };
        created_at: string;
    };
};

export default function NewPostListener() {
    const [newPostsCount, setNewPostsCount] = useState(0);
    const [latestUsers, setLatestUsers] = useState<any[]>([]);
    const { auth } = usePage<any>().props;

    useEcho('post', '.NewPost', (e: NewPostData) => {
        // Skip jika post dari user sendiri
        if (e.post?.user?.id === auth?.user?.id) {
            return;
        }

        // Cek scroll position
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const isAtTop = scrollTop < 100;

        if (isAtTop) {
            // User di top - auto refresh
            router.reload({ only: ['posts'] });
        } else {
            // User sudah scroll - tampilkan notifikasi
            setNewPostsCount((prev) => prev + 1);

            if (e.post?.user) {
                setLatestUsers((prev) => [e.post.user, ...prev].slice(0, 3));
            }
        }
    });

    const handleLoadNewPosts = () => {
        setNewPostsCount(0);
        setLatestUsers([]);

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });

        setTimeout(() => {
            router.reload({ only: ['posts'] });
        }, 300);
    };

    if (newPostsCount === 0) {
        return null;
    }

    return (
        <div className="animate-slide-down fixed top-16 left-1/2 z-[9999] -translate-x-1/2">
            <button
                onClick={handleLoadNewPosts}
                className="group flex items-center gap-3 rounded-full bg-blue-500 py-2.5 pr-5 pl-3 font-medium text-white shadow-xl transition-all hover:bg-blue-600"
            >
                {/* Avatar Stack */}
                <div className="flex -space-x-2 *:ring-2 *:ring-blue-500">
                    {latestUsers.map((user, index) => (
                        <Avatar
                            key={`${user.id}-${index}`}
                            className="h-8 w-8 transition-all duration-300"
                            style={{ zIndex: latestUsers.length - index }}
                        >
                            <AvatarImage
                                src={user.avatar}
                                alt={user.name}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white">
                                {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                </div>

                {/* Text */}
                <span className="text-sm">
                    {latestUsers.length === 1 && newPostsCount === 1
                        ? 'posted'
                        : latestUsers.length > 1 &&
                            newPostsCount > latestUsers.length
                          ? `and ${newPostsCount - latestUsers.length} ${newPostsCount - latestUsers.length === 1 ? 'other' : 'others'} posted`
                          : 'posted'}
                </span>
            </button>
        </div>
    );
}
