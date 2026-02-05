import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import {useUser} from "../../hooks/useUser";

export default function Layout() {
    const {user, loading} = useUser();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">

            {/* Top Navigation */}
            <TopBar user={user} loading={loading} />

            {/* Page Content */}
            <main className="flex-1 w-full">
            <Outlet />   {/* Her bliver siderne indsat */}
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
