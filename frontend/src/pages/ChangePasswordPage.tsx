import { useState } from "react";
import { api } from "../api/api";

const ChangePasswordPage = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState("");
    const [statusClass, setStatusClass] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setStatus("Passwords do not match");
            setStatusClass("text-red-600");
            return;
        }

        try {
            const res = await api("/api/users/me/password", {
                method: "POST",
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword
                })
            });

            const data = await res.json();

            if (!data.success) {
                setStatus(data.error || "Could not change password");
                setStatusClass("text-red-600");
                return;
            }

            setStatus("Password changed successfully.");
            setStatusClass("text-green-600");

            setTimeout(() => {
                window.location.href = "/";
            }, 2000);

        } catch {
            setStatus("Server error");
            setStatusClass("text-red-600");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-semibold mb-4">Change password</h2>

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="password"
                    placeholder="Existing password"
                    className="input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="New password"
                    className="input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Repeat new password"
                    className="input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button className="btn-primary w-full">Change password</button>
            </form>

            {status && <p className={`${statusClass} mt-3`}>{status}</p>}
        </div>
    );
};

export default ChangePasswordPage;
