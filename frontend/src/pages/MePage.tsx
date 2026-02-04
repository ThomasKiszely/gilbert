import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/api";

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
    const navigate = useNavigate();


    // Load profile
    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await api("/api/users/me", {
                });
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
                const res = await api("/api/products/me", {
                });
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
            const res = await api("/api/auth/logout", {
                method: "POST",
            });

            const json = await res.json();

            if (json.success) {
                navigate("/");
            } else {
                setStatus("Logout failed");
            }
        } catch {
            setStatus("Error logging out");
        }
    }

    return (
        <div className="p-6 pb-20">
            <h1 className="profile-title text-3xl font-bold mb-6">My Profile</h1>

            <div className="profile-actions flex flex-col gap-3 mb-8">
                <Link to="/edit-me" className="profile-btn">Edit profile</Link>
                <Link to="/change-password" className="profile-btn">Change password</Link>
                <Link to="/change-email" className="profile-btn">Change email</Link>
                <Link to="/create-product" className="profile-btn">Post a new product</Link>
                <button
                    onClick={handleLogout}
                    className="profile-btn bg-red-800 text-white"
                >
                    Log out
                </button>
            </div>

            {status && <div className="text-red-600 mb-4">{status}</div>}

            {user && (
                <div className="profile-view flex gap-6 mb-10">
                    <img
                        src={user.profile?.avatarUrl || "/api/images/avatars/Gilbert.jpg"}
                        className="profile-avatar w-32 h-32 rounded-full object-cover"
                    />

                    <div className="profile-fields space-y-2">
                        <p><strong>User name:</strong> {user.username}</p>
                        <p><strong>City:</strong> {user.location?.city}</p>
                        <p><strong>Country:</strong> {user.location?.country}</p>
                        <p><strong>CVR:</strong> {user.cvr}</p>
                        <p><strong>Bio:</strong></p>
                        <p>{user.profile?.bio}</p>
                        <p><strong>Language:</strong> {user.profile?.language || "da"}</p>
                    </div>
                </div>
            )}

            <h2 className="section-title text-2xl font-semibold mb-4">Mine produkter</h2>

            <div className="product-grid grid grid-cols-2 sm:grid-cols-3 gap-6">
                {products.map(p => (
                    <Link
                        key={p._id}
                        to={`/edit-product/${p._id}`}
                        className="product-card block shadow bg-white rounded overflow-hidden"
                    >
                        <div className="product-image-wrapper h-40 overflow-hidden">
                            <img
                                src={p.images?.[0]}
                                alt={p.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="product-info p-3">
                            <div className="product-title font-semibold">{p.title}</div>
                            <div className="product-price">{p.price} kr.</div>
                            <div className="product-status text-sm text-gray-500">{p.status}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Bottom navigation */}
            <nav className="bottom-nav fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3">
                <Link to="/" className="nav-item text-xl">🏠</Link>
                <Link to="/search" className="nav-item text-xl">🔍</Link>
                <Link to="/create-product" className="nav-item text-xl">＋</Link>
                <Link to="/favorites" className="nav-item text-xl">❤️</Link>
                <Link to="/me" className="nav-item text-xl">🐱</Link>
            </nav>
        </div>
    );
};

export default MePage;
