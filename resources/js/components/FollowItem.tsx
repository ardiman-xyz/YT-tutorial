export default function FollowItem({
    name,
    username,
}: {
    name: string;
    username: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="font-semibold">{name}</p>
                <p className="text-gray-500">{username}</p>
            </div>
            <button className="rounded-full bg-black px-4 py-1 text-sm font-semibold text-white hover:bg-gray-800">
                Follow
            </button>
        </div>
    );
}
