"use client";

import Link from "next/link";
import Image from "next/image";
import { PackageSearch, MessageCircle, DollarSign, CheckCircle2, AlertTriangle, Bell } from "lucide-react";

interface NotificationDropdownProps {
    notifications: any[];
    onClose: () => void;
}

export default function NotificationDropdown({ notifications, onClose }: NotificationDropdownProps) {

    const getUrl = (n: any) => {
        const d = n.data || {};
        switch (n.type) {
            case "chat_message": return `/chats/${d.chatId || d.threadId}`;
            case "new_bid":      return `/products/${d.productId}`;
            case "bid_accepted": return `/profile/orders`;
            case "report":       return `/admin/reports`;
            case "new_product_from_following": return `/products/${d.productId}`;
            default:             return "#";
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-2xl rounded-2xl border border-gray-100 z-[100] overflow-hidden text-black font-sans">
            <div className="p-4 font-bold border-b bg-gray-50 flex justify-between items-center">
                <span className="text-sm uppercase tracking-widest font-black">Notifications</span>
                <Bell size={16} className="text-gray-400" />
            </div>

            <div className="max-h-[450px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">
                        <Bell size={32} className="mx-auto mb-2 opacity-10" />
                        <p className="text-xs italic">All caught up!</p>
                    </div>
                ) : (
                    notifications.map((n) => {
                        const isNewProduct = n.type === "new_product_from_following";
                        const productImg = n.data?.image;

                        return (
                            <Link
                                key={n._id}
                                href={getUrl(n)}
                                onClick={() => {
                                    fetch(`/api/notifications/${n._id}/read`, { method: "POST" }).catch(() => {});
                                    onClose();
                                }}
                                className={`block p-4 border-b hover:bg-gray-50 transition-all ${!n.read ? "bg-blue-50/30" : ""}`}
                            >
                                <div className="flex gap-3">
                                    {/* VENSTRE SIDE: IKON ELLER PRODUKTBILLEDE */}
                                    <div className="shrink-0">
                                        {isNewProduct && productImg ? (
                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                                <Image
                                                    src={productImg}
                                                    alt="Product"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                                {n.type === "chat_message" && <MessageCircle size={18} className="text-blue-500" />}
                                                {n.type === "new_bid" && <DollarSign size={18} className="text-green-600" />}
                                                {n.type === "bid_accepted" && <CheckCircle2 size={18} className="text-green-500" />}
                                                {n.type === "report" && <AlertTriangle size={18} className="text-burgundy" />}
                                                {!isNewProduct && !n.type?.includes('bid') && <Bell size={18} className="text-gray-400" />}
                                                {isNewProduct && !productImg && <PackageSearch size={18} className="text-racing-green" />}
                                            </div>
                                        )}
                                    </div>

                                    {/* HØJRE SIDE: TEKST */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-black uppercase tracking-tighter text-gray-400 mb-0.5">
                                            {isNewProduct ? "New from seller you follow" : n.type?.replace(/_/g, ' ')}
                                        </p>

                                        <p className="text-sm font-bold leading-snug truncate">
                                            {isNewProduct ? n.data?.title : (n.message || "Click to view")}
                                        </p>

                                        {isNewProduct && n.data?.price && (
                                            <p className="text-[11px] font-serif italic text-racing-green mt-0.5">
                                                {n.data.price} DKK
                                            </p>
                                        )}

                                        {!isNewProduct && n.data?.preview && (
                                            <p className="text-xs text-gray-500 truncate mt-0.5 italic">
                                                "{n.data.preview}"
                                            </p>
                                        )}
                                    </div>

                                    {/* ULÆST INDIKATOR (DEN BLÅ PRIK) */}
                                    {!n.read && (
                                        <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                    )}
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>

            <Link
                href="/profile/notifications"
                onClick={onClose}
                className="block p-3 text-center text-[10px] uppercase font-black tracking-widest bg-gray-50 hover:bg-gray-100 transition text-gray-400"
            >
                View all activity
            </Link>
        </div>
    );
}