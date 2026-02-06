'use client';

import { useState } from "react";
import { api } from "@/app/api/api";
import { useRouter } from "next/navigation";

export default function ChangeEmailPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [status, setStatus] = useState("");
    const [statusClass, setStatusClass] = useState("");

    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (newEmail !== confirmEmail) {
            setStatus("Emails do not match");
            setStatusClass("bg-red-600 text-white");
            return;
        }

        try {
            const res = await api("/api/users/me/email", {
                method: "POST",
                body: JSON.stringify({
                    currentPassword,
                    newEmail,
                    confirmEmail
                })
            });

            const data = await res.json();

            if (!data.success) {
                setStatus(data.error || "Could not change email");
                setStatusClass("bg-red-600 text-white");
                return;
            }

            setStatus("Check your mailbox to confirm the change");
            setStatusClass("bg-green-700 text-white");

            setTimeout(() => {
                router.push("/");
            }, 2000);

        } catch {
            setStatus("Server error");
            setStatusClass("bg-red-600 text-white");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-ivory-dark rounded-2xl shadow-2xl border border-racing-green/10 text-racing-green">
            <h2 className="text-2xl font-serif font-bold mb-6 uppercase tracking-tight border-b border-racing-green/10 pb-3">
                Change email
            </h2>

            {status && (
                <div className={`mb-6 p-3 rounded-lg text-center text-sm font-semibold shadow-sm ${statusClass}`}>
                    {status}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Enter password</label>
                    <input
                        type="password"
                        className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green outline-none text-black placeholder:text-gray-400"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Enter new email</label>
                    <input
                        type="email"
                        className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green outline-none text-black placeholder:text-gray-400"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1">Repeat new email</label>
                    <input
                        type="email"
                        className="w-full p-3 bg-ivory border border-racing-green/20 rounded-lg focus:ring-2 focus:ring-racing-green outline-none text-black placeholder:text-gray-400"
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        required
                    />
                </div>

                <button className="w-full bg-racing-green text-ivory py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-racing-green-dark transition-all shadow-lg active:scale-[0.98] mt-2">
                    Change email
                </button>
            </form>
        </div>
    );
}