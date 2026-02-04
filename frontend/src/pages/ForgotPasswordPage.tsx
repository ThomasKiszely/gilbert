import { useState } from "react";
import { api } from "../api/api";

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

            await res.json(); // vi ignorerer success/failure af sikkerhedsgrunde

            setStatus("If the email exists, a reset link has been sent.");
            setStatusClass("text-green-600");
        } catch {
            setStatus("Server error");
            setStatusClass("text-red-600");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
            <h2 className="text-2xl font-semibold mb-4">Forgot Password</h2>

            <p className={statusClass}>{status}</p>

            <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded mt-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <button
                onClick={handleSend}
                className="mt-5 px-4 py-2 bg-black text-white rounded"
            >
                Send Reset Link
            </button>
        </div>
    );
};

export default ForgotPasswordPage;
