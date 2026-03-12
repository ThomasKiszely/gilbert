"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginForm() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"error" | "info">("error");

    useEffect(() => {
        const reason = searchParams.get("reason");
        if (reason === "session_expired") {
            setMessageType("info");
            setMessage("Your session has expired. Please log in again.");
        }
    }, [searchParams]);

    function switchTab(tab: "login" | "register") {
        setActiveTab(tab);
        setMessage("");
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
            location: { city: payload.city, country: payload.country }
        };

        if (payload.cvr?.trim()) registerPayload.cvr = payload.cvr.trim();

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
            setMessageType("error");
            setMessage("Server error");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-[#f2e8d5] rounded-2xl shadow-xl text-[#6b2121]">

            {/* Tabs - Matcher billedets bordeaux farve og streg */}
            <div className="flex mb-8 relative border-b border-[#6b2121]/10">
                <button
                    className={`flex-1 py-3 text-lg font-medium transition-all relative ${
                        activeTab === "login" ? "text-[#6b2121]" : "text-[#6b2121]/40"
                    }`}
                    onClick={() => switchTab("login")}
                >
                    Login
                    {activeTab === "login" && (
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#003d2b]" />
                    )}
                </button>

                <button
                    className={`flex-1 py-3 text-lg font-medium transition-all relative ${
                        activeTab === "register" ? "text-[#6b2121]" : "text-[#6b2121]/40"
                    }`}
                    onClick={() => switchTab("register")}
                >
                    Register
                    {activeTab === "register" && (
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#003d2b]" />
                    )}
                </button>
            </div>

            {message && (
                <p className={`mb-4 text-sm text-center font-bold ${messageType === "error" ? "text-red-600" : "text-blue-700"}`}>
                    {message}
                </p>
            )}

            {activeTab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        className="w-full p-4 bg-white border border-gray-300 rounded-xl text-black outline-none focus:border-[#003d2b]"
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        required
                        className="w-full p-4 bg-white border border-gray-300 rounded-xl text-black outline-none focus:border-[#003d2b]"
                    />
                    <button className="w-full bg-[#003d2b] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#002b1e] transition-all">
                        Login
                    </button>
                    <div className="text-center mt-4">
                        <Link href="/forgot-password" title="Glemt password" className="text-sm underline text-[#003d2b] hover:opacity-80">
                            Forgot your password?
                        </Link>
                    </div>
                </form>
            )}

            {activeTab === "register" && (
                <form onSubmit={handleRegister} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input name="username" placeholder="Username" required className="p-3 bg-white border border-gray-300 rounded-xl text-black text-sm outline-none focus:border-[#003d2b]" />
                        <input name="email" type="email" placeholder="Email" required className="p-3 bg-white border border-gray-300 rounded-xl text-black text-sm outline-none focus:border-[#003d2b]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input name="city" placeholder="City" required className="p-3 bg-white border border-gray-300 rounded-xl text-black text-sm outline-none focus:border-[#003d2b]" />
                        <input name="country" placeholder="Country" required className="p-3 bg-white border border-gray-300 rounded-xl text-black text-sm outline-none focus:border-[#003d2b]" />
                    </div>
                    <input name="cvr" placeholder="CVR (optional)" className="w-full p-3 bg-white border border-gray-300 rounded-xl text-black text-sm outline-none focus:border-[#003d2b]" />
                    <input name="password" type="password" placeholder="Password" required className="w-full p-3 bg-white border border-gray-300 rounded-xl text-black text-sm outline-none focus:border-[#003d2b]" />
                    <input name="confirmPassword" type="password" placeholder="Confirm Password" required className="w-full p-3 bg-white border border-gray-300 rounded-xl text-black text-sm outline-none focus:border-[#003d2b]" />

                    <label className="flex items-start gap-2 py-2 cursor-pointer">
                        <input type="checkbox" name="termsAccepted" className="mt-1 accent-[#003d2b]" />
                        <span className="text-xs text-[#6b2121]/70">
                            I accept the <Link href="/terms" target="_blank" className="underline font-bold text-[#003d2b]">Terms of Service</Link>
                        </span>
                    </label>

                    <button className="w-full bg-[#003d2b] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#002b1e] transition-all">
                        Register
                    </button>
                </form>
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="text-center p-20 text-white">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}