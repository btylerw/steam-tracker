import Image from "next/image";

export default function Header({ profile }) {
    return (
        <header className="bg-gray-900 p-4 flex items-center gap-4 shadow">
        <Image
            src={profile.avatar_url}
            alt="avatar"
            width={48}
            height={48}
            className="rounded-full"
        />
        <div>
            <h1 className="text-lg font-semibold text-black-50">{profile.display_name}</h1>
        </div>
        </header>
    );
}
