"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Vi pakker selve form-logikken ind i en sub-komponent for at
// Next.js ikke brokker sig over useSearchParams uden en Suspense boundary.
function LoginForm() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"error" | "info">("error");

    useEffect(() => {
        const reason = searchParams.get("reason");
        if (reason === "session_expired") {
            setMessageType("info");
            setMessage("Your session has expired. Please log in again to enter the vault.");
        }
    }, [searchParams]);

    function switchTab(tab: "login" | "register") {
        setActiveTab(tab);
        setMessage("");
        setMessageType("error");
    }

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload = Object.fromEntries(formData.entries());
        submitAuth("login", payload);
    }

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload: any = Object.fromEntries(formData.entries());

        if (payload.password !== payload.confirmPassword) {
            setMessageType("error");
            return setMessage("Passwords do not match");
        }

        if (!payload.termsAccepted) {
            setMessageType("error");
            return setMessage("You must accept the terms");
        }

        const registerPayload: any = {
            username: payload.username,
            email: payload.email,
            password: payload.password,
            confirmPassword: payload.confirmPassword,
            termsAccepted: true,
            location: {
                city: payload.city,
                country: payload.country
            }
        };

        if (payload.cvr?.trim()) {
            registerPayload.cvr = payload.cvr.trim();
        }

        submitAuth("register", registerPayload);
    }

    async function submitAuth(endpoint: string, payload: any) {
        try {
            const res = await fetch(`/api/auth/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!data.success) {
                if (data.code === "TERMS_OUTDATED") {
                    window.location.href = "/terms?action=accept";
                    return;
                }
                setMessageType("error");
                return setMessage(data.error || "Something went wrong");
            }

            if (endpoint === "register") {
                setMessageType("info");
                return setMessage("User registered. Please verify your email.");
            }

            window.location.href = "/";
        } catch (err) {
            console.error(err);
            setMessageType("error");
            setMessage("Server error");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-ivory-dark rounded-[2rem] shadow-2xl text-racing-green border border-racing-green/5">
            {/* Tabs */}
            <div className="flex mb-8 bg-ivory/50 rounded-xl p-1">
                <button
                    className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === "login"
                            ? "bg-white text-racing-green shadow-sm"
                            : "text-racing-green/40 hover:text-racing-green"
                    }`}
                    onClick={() => switchTab("login")}
                >
                    Login
                </button>

                <button
                    className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === "register"
                            ? "bg-white text-racing-green shadow-sm"
                            : "text-racing-green/40 hover:text-racing-green"
                    }`}
                    onClick={() => switchTab("register")}
                >
                    Register
                </button>
            </div>

            {/* Message Display */}
            {message && (
                <div className={`mb-6 p-4 rounded-xl text-[11px] font-bold uppercase tracking-wider text-center border animate-in fade-in slide-in-from-top-2 ${
                    messageType === "info"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : "bg-red-50 text-red-600 border-red-100"
                }`}>
                    {message}
                </div>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Email</label>
                        <input name="email" type="email" placeholder="collector@gilbert.dk" required className="w-full p-4 bg-ivory border border-racing-green/10 rounded-xl text-black font-bold outline-none focus:border-racing-green/30" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Password</label>
                        <input name="password" type="password" placeholder="Your password" required className="w-full p-4 bg-ivory border border-racing-green/10 rounded-xl text-black font-bold outline-none focus:border-racing-green/30" />
                    </div>
                    <button className="w-full bg-racing-green text-ivory py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg hover:bg-zinc-800 transition-all mt-4">
                        Access Account
                    </button>
                    <div className="text-center mt-6">
                        <a href="/forgot-password" hidden className="text-[10px] font-black uppercase tracking-widest text-racing-green/40 hover:text-racing-green">
                            Forgot Password?
                        </a>
                    </div>
                </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
                <form onSubmit={handleRegister} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input name="username" placeholder="Username" required className="p-4 bg-ivory border border-racing-green/10 rounded-xl text-black font-bold text-sm" />
                        <input name="email" type="email" placeholder="Email" required className="p-4 bg-ivory border border-racing-green/10 rounded-xl text-black font-bold text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input name="city" placeholder="City" required className="p-4 bg-ivory border border-racing-green/10 rounded-xl text-black font-bold text-sm" />
                        <input name="country" placeholder="Country" required className="p-4 bg-ivory border border-racing-green/10 rounded-xl text-black font-bold text-sm" />
                    </div>
                    <input name="cvr" placeholder="CVR (optional)" className="w-full p-4 bg-ivory border border-racing-green/10 rounded-xl text-black font-bold text-sm" />
                    <input name="password" type="password" placeholder="Password" required className="w-full p-4 bg-ivory border border-racing-green/10 rounded-xl text-black font-bold text-sm" />
                    <input name="confirmPassword" type="password" placeholder="Confirm Password" required className="w-full p-4 bg-ivory border border-racing-green/10 rounded-xl text-black font-bold text-sm" />

                    <label className="flex items-start gap-3 p-4 bg-white/40 rounded-xl cursor-pointer">
                        <input type="checkbox" name="termsAccepted" className="mt-1 accent-racing-green" />
                        <span className="text-[10px] font-medium leading-relaxed opacity-70">
                            I accept the {" "}
                            <Link href="/terms" target="_blank" className="underline font-black text-racing-green">
                                Terms of Service
                            </Link>
                            {" "} regarding manual authentication and vault security.
                        </span>
                    </label>

                    <button className="w-full bg-racing-green text-ivory py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg hover:bg-zinc-800 transition-all mt-4">
                        Create Membership
                    </button>
                </form>
            )}
        </div>
    );
}

// Main Page export med Suspense for at håndtere useSearchParams
export default function LoginPage() {
    return (
        <Suspense fallback={<div className="text-center p-20 font-serif italic text-racing-green">Loading vault access...</div>}>
            <LoginForm />
        </Suspense>
    );
}