'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/app/api/api";

interface UserProfile {
    username: string;
    cvr?: string;
    location?: { city?: string; country?: string };
    profile?: { bio?: string; language?: string; avatarUrl?: string };
}

interface MyProduct {
    _id: string;
    title: string;
    price: number;
    status: string;
    images: string[];
}

const MePage = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [products, setProducts] = useState<MyProduct[]>([]);
    const [status, setStatus] = useState("");
    const router = useRouter();

    // Load profile
    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await api("/api/users/me");
                const json = await res.json();

                if (!json.success) throw new Error("Could not fetch profile");

                setUser(json.data);
            } catch (err: any) {
                setStatus("Error: " + err.message);
            }
        }

        loadProfile();
    }, []);

    // Load products
    useEffect(() => {
        async function loadMyProducts() {
            try {
                const res = await api("/api/products/me");
                const json = await res.json();

                if (!json.success) throw new Error("Could not fetch products");

                setProducts(json.data);
            } catch (err) {
                console.error(err);
            }
        }

        loadMyProducts();
    }, []);

    async function handleLogout() {
        try {
            await api("/api/auth/logout", { method: "POST" });
        } catch {
            // backend-fejl er ligegyldige for logout
        }

        localStorage.removeItem("token");
        router.push("/");
    }

    return (
        <div className="p-6 pb-20">
            <h1 className="profile-title text-3xl font-bold mb-6">My Profile</h1>

            <div className="profile-actions flex flex-wrap gap-3 mb-8">
                {/* Opdateret hrefs til at matche din nye mappestruktur */}
                <Link href="/profile/edit" className="profile-btn">Edit profile</Link>
                <Link href="/profile/change-password" className="profile-btn">Change password</Link>
                <Link href="/profile/change-email" className="profile-btn">Change email</Link>
                <Link href="/products/create" className="profile-btn">Post a new product</Link>
                <button
                    onClick={handleLogout}
                    className="profile-btn bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900 transition"
                >
                    Log out
                </button>
            </div>

            {status && <div className="text-red-600 mb-4">{status}</div>}

            {user && (
                <div className="profile-view flex flex-col md:flex-row gap-6 mb-10">
                    <img
                        src={user.profile?.avatarUrl || "/api/images/avatars/Gilbert.jpg"}
                        className="profile-avatar w-32 h-32 rounded-full object-cover shadow-sm"
                        alt="Profile avatar"
                    />

                    <div className="profile-fields space-y-2">
                        <p><strong>User name:</strong> {user.username}</p>
                        <p><strong>City:</strong> {user.location?.city || "Ikke angivet"}</p>
                        <p><strong>Country:</strong> {user.location?.country || "Ikke angivet"}</p>
                        <p><strong>CVR:</strong> {user.cvr || "N/A"}</p>
                        <p><strong>Bio:</strong></p>
                        <p className="italic text-gray-700">{user.profile?.bio || "Ingen bio endnu..."}</p>
                        <p><strong>Language:</strong> {user.profile?.language || "da"}</p>
                    </div>
                </div>
            )}

            <h2 className="section-title text-2xl font-semibold mb-4">Mine produkter</h2>

            <div className="product-grid grid grid-cols-2 sm:grid-cols-3 gap-6">
                {products.length === 0 ? (
                    <p className="text-gray-500">Du har ikke oprettet nogen produkter endnu.</p>
                ) : (
                    products.map(p => (
                        <Link
                            key={p._id}
                            href={`/products/edit/${p._id}`}
                            className="product-card block shadow bg-white rounded overflow-hidden hover:shadow-md transition"
                        >
                            <div className="product-image-wrapper h-40 overflow-hidden bg-gray-100">
                                <img
                                    src={p.images?.[0] || "/images/placeholder.jpg"}
                                    alt={p.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="product-info p-3">
                                <div className="product-title font-semibold truncate">{p.title}</div>
                                <div className="product-price">{p.price} kr.</div>
                                <div className="product-status text-sm text-gray-500 capitalize">{p.status}</div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default MePage;