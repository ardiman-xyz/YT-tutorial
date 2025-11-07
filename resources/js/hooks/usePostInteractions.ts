import type { Post } from '@/types/post';
import axios from 'axios';
import { toast } from 'sonner';

export function usePostInteractions(
    posts: Post[],
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>,
) {
    const handleLike = async (postId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();

        try {
            const response = await axios.post(`/posts/${postId}/like`);

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              is_liked: response.data.isLiked,
                              likes_count: response.data.likesCount,
                          }
                        : post,
                ),
            );
        } catch (error) {
            console.error('Error toggling like:', error);
            toast.error('Failed to like post');
        }
    };

    const handleFollow = async (userId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();

        try {
            const response = await axios.post(`/users/${userId}/follow`);

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.user.id === userId
                        ? {
                              ...post,
                              is_following: response.data.isFollowing,
                          }
                        : post,
                ),
            );
        } catch (error) {
            console.error('Error toggling follow:', error);
            toast.error('Failed to follow user');
        }
    };

    const handleRepost = async (postId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();

        try {
            const response = await axios.post(`/posts/${postId}/repost`);

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              is_reposted: response.data.isReposted,
                              reposts_count: response.data.repostsCount,
                          }
                        : post,
                ),
            );
        } catch (error) {
            console.error('Error toggling repost:', error);
            toast.error('Failed to repost');
        }
    };

    const handleBookmark = async (postId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();

        try {
            const response = await axios.post(`/posts/${postId}/bookmark`);

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              is_bookmarked: response.data.isBookmarked,
                          }
                        : post,
                ),
            );

            toast.success(
                response.data.isBookmarked
                    ? 'Post bookmarked'
                    : 'Bookmark removed',
            );
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            toast.error('Failed to bookmark post');
        }
    };

    return {
        handleLike,
        handleFollow,
        handleRepost,
        handleBookmark,
    };
}
