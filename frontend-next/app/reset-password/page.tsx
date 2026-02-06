'use client';

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/app/api/api";

const ResetPasswordPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState("Enter your new password");
    const [statusClass, setStatusClass] = useState("");

    async function handleReset() {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("Missing reset token");
            setStatusClass("text-red-600 font-medium");
            return;
        }

        if (password !== confirmPassword) {
            setStatus("Passwords do not match");
            setStatusClass("text-red-600 font-medium");
            return;
        }

        try {
            const res = await api(`/api/auth/reset-password?token=${token}`, {
                method: "POST",
                body: JSON.stringify({ password, confirmPassword })
            });

            const data = await res.json();

            if (data.success) {
                setStatus("Password reset successfully");
                setStatusClass("text-green-600 font-medium");

                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } else {
                setStatus(data.error || "Password reset failed");
                setStatusClass("text-red-600 font-medium");
            }
        } catch {
            setStatus("Server error");
            setStatusClass("text-red-600 font-medium");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center border border-gray-50">
            <h2 className="text-2xl font-semibold mb-4">Password reset</h2>

            <div className={`min-h-[1.5rem] mb-2 ${statusClass}`}>
                {status}
            </div>

            <input
                type="password"
                placeholder="New password"
                className="w-full p-2 border rounded mt-4 focus:ring-2 focus:ring-black outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <input
                type="password"
                placeholder="Confirm password"
                className="w-full p-2 border rounded mt-4 focus:ring-2 focus:ring-black outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
                onClick={handleReset}
                className="mt-5 w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors font-medium"
            >
                Reset Password
            </button>
        </div>
    );
};

export default ResetPasswordPage;