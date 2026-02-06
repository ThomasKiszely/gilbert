'use client';

import { useState } from "react";
import { api } from "@/app/api/api";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("Enter your email to receive a reset link");
    const [statusClass, setStatusClass] = useState("");

    async function handleSend() {
        if (!email.trim()) {
            setStatus("Please enter an email");
            setStatusClass("text-red-600");
            return;
        }

        try {
            const res = await api("/api/auth/request-password-reset", {
                method: "POST",
                body: JSON.stringify({ email })
            });

            // Vi venter på res, men følger din logik med at ignorere det specifikke svar
            await res.json();

            setStatus("If the email exists, a reset link has been sent.");
            setStatusClass("text-green-600 font-medium");
        } catch {
            setStatus("Server error");
            setStatusClass("text-red-600 font-medium");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
            <h2 className="text-2xl font-semibold mb-4">Forgot Password</h2>

            <p className={`${statusClass} min-h-[1.5rem]`}>{status}</p>

            <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded mt-4 focus:outline-none focus:ring-2 focus:ring-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <button
                onClick={handleSend}
                className="mt-5 w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
            >
                Send Reset Link
            </button>

            <div className="mt-4">
                <a href="/login" className="text-sm text-gray-500 hover:underline">
                    Back to login
                </a>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;