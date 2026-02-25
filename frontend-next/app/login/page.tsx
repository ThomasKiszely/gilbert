"use client";
import { useState } from "react";
import Link from "next/link"; // ⭐ Husk at importere Link

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [message, setMessage] = useState("");

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
            return setMessage("Passwords do not match");
        }

        if (!payload.termsAccepted) {
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
                // Hvis terms er outdated, sender vi dem til den nye side med en besked
                if (data.code === "TERMS_OUTDATED") {
                    window.location.href = "/terms?action=accept"; // ⭐ Send brugeren til terms-siden
                    return;
                }
                return setMessage(data.error || "Something went wrong");
            }

            if (endpoint === "register") {
                return setMessage("User registered. Please verify your email.");
            }

            window.location.href = "/";
        } catch (err) {
            console.error(err);
            setMessage("Server error");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-ivory-dark rounded-xl shadow-lg text-burgundy">

            {/* Tabs */}
            <div className="flex mb-4">
                <button
                    className={`text-burgundy flex-1 py-2 ${activeTab === "login" ? "border-b-2 border-racing-green" : ""}`}
                    onClick={() => switchTab("login")}
                >
                    Login
                </button>

                <button
                    className={`text-burgundy flex-1 py-2 ${activeTab === "register" ? "border-b-2 border-racing-green" : ""}`}
                    onClick={() => switchTab("register")}
                >
                    Register
                </button>
            </div>

            {/* Message */}
            {message && (
                <p className="text-red-600 mb-3">{message}</p>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
                <form onSubmit={handleLogin} className="space-y-3">
                    <input name="email" type="email" placeholder="Email" required className="input" />
                    <input name="password" type="password" placeholder="Password" required className="input" />
                    <button className="btn-primary w-full">Login</button>
                    <div className="text-center mt-3">
                        <a href="/forgot-password" className="text-sm underline text-racing-green">
                            Forgot your password?
                        </a>
                    </div>
                </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
                <form onSubmit={handleRegister} className="space-y-3">
                    <input name="username" placeholder="Username" required className="input" />
                    <input name="email" type="email" placeholder="Email" required className="input" />
                    <input name="city" placeholder="City" required className="input" />
                    <input name="country" placeholder="Country" required className="input" />
                    <input name="cvr" placeholder="CVR (optional)" className="input" />
                    <input name="password" type="password" placeholder="Password" required className="input" />
                    <input name="confirmPassword" type="password" placeholder="Confirm Password" required className="input" />

                    {/* ⭐ Her linker vi til /terms i stedet for at åbne popup */}
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="termsAccepted" />
                        <span>
                            I accept the{" "}
                            <Link
                                href="/terms"
                                target="_blank"
                                className="underline text-racing-green font-semibold"
                            >
                                Terms of Service
                            </Link>
                        </span>
                    </label>

                    <button className="btn-primary w-full">Register</button>
                </form>
            )}
        </div>
    );
}