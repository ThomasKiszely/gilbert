"use client";

import Link from "next/link";

interface NotificationDropdownProps {
    notifications: any[];
    onClose: () => void;
}

export default function NotificationDropdown({ notifications, onClose }: NotificationDropdownProps) {

    // Bestemmer URL baseret på backend-typen
    const getUrl = (n: any) => {
        const d = n.data || {};
        switch (n.type) {
            case "chat_message": return `/chat/${d.chatId || d.threadId}`;
            case "new_bid":      return `/products/${d.productId}`;
            case "bid_accepted": return `/profile/orders`;
            default:             return "#";
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-2xl rounded-xl border border-gray-100 z-[100] overflow-hidden text-black">
            <div className="p-4 font-bold border-b bg-gray-50">Notifikationer</div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">Ingen nye beskeder</div>
                ) : (
                    notifications.map((n) => (
                        <Link
                            key={n._id}
                            href={getUrl(n)}
                            onClick={() => {
                                fetch(`/api/notifications/${n._id}/read`, { method: "POST" }).catch(() => {});
                                onClose();
                            }}
                            className={`block p-4 border-b hover:bg-gray-50 transition ${!n.read ? "bg-blue-50/50" : ""}`}
                        >
                            <p className="text-sm font-semibold">
                                {n.type === "chat_message" ? "✉️ Ny besked" : "💰 Nyt bud"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {n.data?.preview || "Klik for at se detaljer"}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}