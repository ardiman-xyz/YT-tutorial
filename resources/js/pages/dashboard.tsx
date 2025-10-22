import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Post } from './_components/Post';
import { PostEditor } from './_components/PostEditor';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const mockPosts = [
        {
            id: 1,
            user: {
                id: 1,
                name: 'Shelby',
                username: 'shelbyserves',
                avatar: 'https://i.pravatar.cc/150?img=1',
                verified: true,
            },
            content:
                'The network built to serve is now serving.\n\nShelby Devnet is live.\n\nStart testing with the CLI or SDK.',
            media: [
                {
                    id: 1,
                    url: 'https://picsum.photos/600/400?random=1',
                    type: 'video' as const,
                    thumbnail: 'https://picsum.photos/600/400?random=1',
                    duration: '0:23',
                },
            ],
            timestamp: '2h',
            source: 'shelby.xyz',
            likes: 44,
            replies: 11,
            reposts: 4,
            views: 163000,
            isLiked: false,
            isReposted: false,
            isBookmarked: false,
        },
        {
            id: 2,
            user: {
                id: 2,
                name: 'Tech News',
                username: 'technews',
                avatar: 'https://i.pravatar.cc/150?img=2',
                verified: true,
            },
            content:
                '🚀 Breaking: Next.js 14 is here with amazing new features including:\n\n• Turbopack stable\n• Server Actions stable\n• Partial Prerendering (Preview)\n• Metadata improvements\n\nTime to upgrade your projects! 🎉',
            media: [],
            timestamp: '4h',
            source: 'Web',
            likes: 1234,
            replies: 89,
            reposts: 234,
            views: 45600,
            isLiked: true,
            isReposted: false,
            isBookmarked: true,
        },
        {
            id: 3,
            user: {
                id: 3,
                name: 'Design Daily',
                username: 'designdaily',
                avatar: 'https://i.pravatar.cc/150?img=3',
                verified: false,
            },
            content: 'Beautiful gradient collection for your next project 🎨',
            media: [
                {
                    id: 1,
                    url: 'https://picsum.photos/600/400?random=2',
                    type: 'image' as const,
                },
                {
                    id: 2,
                    url: 'https://picsum.photos/600/400?random=3',
                    type: 'image' as const,
                },
                {
                    id: 3,
                    url: 'https://picsum.photos/600/400?random=4',
                    type: 'image' as const,
                },
                {
                    id: 4,
                    url: 'https://picsum.photos/600/400?random=5',
                    type: 'image' as const,
                },
            ],
            timestamp: '6h',
            source: 'Web',
            likes: 567,
            replies: 23,
            reposts: 45,
            views: 12300,
            isLiked: false,
            isReposted: true,
            isBookmarked: false,
        },
        {
            id: 4,
            user: {
                id: 4,
                name: 'Code Tips',
                username: 'codetips',
                avatar: 'https://i.pravatar.cc/150?img=4',
                verified: true,
            },
            content:
                '💡 Pro tip: Use React.memo() to prevent unnecessary re-renders in your React components.\n\nconst MemoizedComponent = React.memo(MyComponent, (prevProps, nextProps) => {\n  // Return true if props are equal\n  return prevProps.id === nextProps.id;\n});',
            media: [
                {
                    id: 1,
                    url: 'https://picsum.photos/600/800?random=6',
                    type: 'image' as const,
                },
            ],
            timestamp: '8h',
            source: 'Web',
            likes: 892,
            replies: 45,
            reposts: 123,
            views: 23400,
            isLiked: false,
            isReposted: false,
            isBookmarked: false,
        },
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-2xl">
                <PostEditor
                    user={{
                        id: 1,
                        name: 'User Name',
                        username: 'username',
                        avatar: 'https://i.pravatar.cc/150?img=3',
                    }}
                    onPostCreated={() => {}}
                />

                <div className="border-b py-3 text-center">
                    <Button variant="link" className="text-primary">
                        Show 140 posts
                    </Button>
                </div>

                <div className="divide-y divide-border">
                    {mockPosts.map((post) => (
                        <Post
                            key={post.id}
                            {...post}
                            onLike={() => console.log('Liked post', post.id)}
                            onRepost={() => console.log('Reposted', post.id)}
                            onBookmark={() =>
                                console.log('Bookmarked', post.id)
                            }
                            onReply={() => console.log('Reply to', post.id)}
                            onShare={() => console.log('Share', post.id)}
                        />
                    ))}
                </div>

                <div className="p-4 text-center">
                    <button className="text-primary hover:underline">
                        Load more posts
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
