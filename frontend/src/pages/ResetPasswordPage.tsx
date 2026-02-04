import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";

const ResetPasswordPage = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState("Enter your new password");
    const [statusClass, setStatusClass] = useState("");

    async function handleReset() {
        const token = params.get("token");

        if (!token) {
            setStatus("Missing reset token");
            setStatusClass("text-red-600");
            return;
        }

        if (password !== confirmPassword) {
            setStatus("Passwords do not match");
            setStatusClass("text-red-600");
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
                setStatusClass("text-green-600");

                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } else {
                setStatus(data.error || "Password reset failed");
                setStatusClass("text-red-600");
            }
        } catch {
            setStatus("Server error");
            setStatusClass("text-red-600");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
            <h2 className="text-2xl font-semibold mb-4">Password reset</h2>

            <p className={statusClass}>{status}</p>

            <input
                type="password"
                placeholder="New password"
                className="w-full p-2 border rounded mt-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <input
                type="password"
                placeholder="Confirm password"
                className="w-full p-2 border rounded mt-4"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
                onClick={handleReset}
                className="mt-5 px-4 py-2 bg-black text-white rounded"
            >
                Reset Password
            </button>
        </div>
    );
};

export default ResetPasswordPage;
