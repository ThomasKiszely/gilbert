"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/UI/avatar";

interface UserCardProps {
    id: string;
    username: string;
    image?: string;
}

export default function UserCard({ id, username, image }: UserCardProps) {
    const initials = username
        .slice(0, 2)
        .toUpperCase();

    return (
        <Link
            href={`/profile/${id}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/30 hover:bg-muted/50 transition-colors shadow-sm"
        >
            <Avatar className="h-12 w-12 border border-border/30">
                <AvatarImage src={image || ""} alt={username} />
                <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                    {initials}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-foreground truncate">
                    {username}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                    View profile
                </p>
            </div>
        </Link>
    );
}
