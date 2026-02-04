import { useState } from "react";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function ChangeEmailPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [status, setStatus] = useState("");
    const [statusClass, setStatusClass] = useState("");

    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (newEmail !== confirmEmail) {
            setStatus("Emails do not match");
            setStatusClass("text-red-600");
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
                setStatusClass("text-red-600");
                return;
            }

            setStatus("Check your mailbox to confirm the change");
            setStatusClass("text-green-600");

            setTimeout(() => {
                navigate("/");
            }, 2000);

        } catch {
            setStatus("Server error");
            setStatusClass("text-red-600");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-semibold mb-4">Change email</h2>

            {status && <p className={`${statusClass} mb-3`}>{status}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <label>Enter password</label>
                    <input
                        type="password"
                        className="input"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Enter new email</label>
                    <input
                        type="email"
                        className="input"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Repeat new email</label>
                    <input
                        type="email"
                        className="input"
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        required
                    />
                </div>

                <button className="btn-primary w-full">Change email</button>
            </form>
        </div>
    );
}
