import { Outlet } from "react-router-dom";
import {useUser} from "../../hooks/useUser";

export default function Layout() {
    const {user, loading} = useUser();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">

            {/* Top Navigation */}
            <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="text-2xl font-semibold tracking-wide">GILBERT</div>

                <div className="hidden md:flex gap-6 text-sm">

                    <a href="/me">My Page</a>
                    <a href="/create-product">Create Product</a>


                    {!user && !loading && (
                        <a href="/login">Login</a>
                    )}


                    {user && (
                        <>
                            {/* Kun admins ser Admin */}
                            {user.role === "admin" && (
                                <a href="/admin">Admin</a>
                            )}

                            <button id="logoutBtn">Logout</button>
                        </>
                    )}
                </div>
            </nav>

            {/* Page Content */}
            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6">
                <Outlet />   {/* ⭐ Her bliver siderne indsat */}
            </main>

            {/* Bottom Navigation */}
            <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-white/10 py-3 px-6 flex justify-between md:hidden">
                <a href="/" className="flex flex-col items-center text-xs">
                    <span>🏠</span>
                    Home
                </a>
                <a href="/search" className="flex flex-col items-center text-xs">
                    <span>🔍</span>
                    Search
                </a>
                <a href="/favorites" className="flex flex-col items-center text-xs">
                    <span>❤️</span>
                    Favorites
                </a>
                <a href="/me" className="flex flex-col items-center text-xs">
                    <span>👤</span>
                    Profile
                </a>
            </footer>
        </div>
    );
}
