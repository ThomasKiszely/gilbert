import { useState } from "react";

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");
    const [message, setMessage] = useState("");
    const [showTerms, setShowTerms] = useState(false);
    const [showAcceptButton, setShowAcceptButton] = useState(false);

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
                if (data.code === "TERMS_OUTDATED") {
                    setShowAcceptButton(true);
                    setShowTerms(true);
                    return;
                }

                if (data.code === "EMAIL_NOT_VERIFIED") {
                    setMessage("Your email is not verified");
                    return;
                }

                if (data.errors) {
                    return setMessage(data.errors.join(", "));
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

    async function acceptTerms() {
        const res = await fetch("/api/auth/acceptTerms", {
            method: "POST",
            credentials: "include"
        });

        const data = await res.json();

        if (data.success) {
            setShowTerms(false);
            window.location.reload();
        } else {
            setMessage(data.error || "Could not accept terms");
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

                    {/* ⭐ Updated Terms Checkbox with clickable link */}
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="termsAccepted" />
                        <span>
                            I accept the{" "}
                            <button
                                type="button"
                                className="underline text-racing-green"
                                onClick={() => setShowTerms(true)}
                            >
                                Terms of Service
                            </button>
                        </span>
                    </label>

                    <button className="btn-primary w-full">Register</button>
                </form>
            )}

            {/* Terms Modal */}
            {showTerms && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto shadow-xl relative">

                        <button
                            className="absolute top-3 right-3 text-xl"
                            onClick={() => setShowTerms(false)}
                        >
                            ×
                        </button>

                        <h2 className="text-xl font-semibold mb-3">Terms & Conditions</h2>

                        <div className="text-sm space-y-3">
                            <p><strong>Version 1.0.0</strong></p>
                            <p>Her indsætter du dine terms-tekster…</p>
                        </div>

                        {showAcceptButton && (
                            <button onClick={acceptTerms} className="btn-primary w-full mt-4">
                                Accept Terms
                            </button>
                        )}

                        <button
                            className="mt-3 text-gray-600 underline w-full"
                            onClick={() => setShowTerms(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
