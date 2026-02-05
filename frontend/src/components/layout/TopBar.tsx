import { Bell, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../UI/button.tsx";

const TopBar = ({ user, loading }: { user: any; loading: boolean }) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
            <div className="flex items-center justify-between px-4 py-3">

                {/* Left - Notifications */}
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
                    <Bell className="h-5 w-5" />
                </Button>

                {/* Center - Logo */}
                <Link to="/" className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold tracking-widest text-foreground font-serif">
                        GILBERT
                    </h1>
                </Link>

                {/* Right - Cart */}
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
                    <ShoppingBag className="h-5 w-5" />
                </Button>
            </div>

            {/* Navigation links */}
            <nav className="flex justify-center gap-4 py-2 text-sm opacity-80">
                <Link to="/me">My Page</Link>
                <Link to="/create-product">Create Product</Link>

                {!user && !loading && (
                    <Link to="/login">Login</Link>
                )}

                {user && (
                    <>
                        {user.role === "admin" && (
                            <Link to="/admin">Admin</Link>
                        )}

                        <button id="logoutBtn">Logout</button>
                    </>
                )}
            </nav>
        </header>
    );
};

export default TopBar;
