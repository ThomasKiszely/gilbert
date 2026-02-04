import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api/api";

const VerifyEmailPage = () => {
    const [status, setStatus] = useState("Verifying your email...");
    const [statusClass, setStatusClass] = useState("");
    const [params] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function verify() {
            const token = params.get("token");

            if (!token) {
                setStatus("Missing verification token.");
                setStatusClass("text-red-600");
                return;
            }

            try {
                const res = await api(`/api/auth/verify-email?token=${token}`);
                const data = await res.json();

                if (data.success) {
                    setStatus("Your email has been verified!");
                    setStatusClass("text-green-600");

                    setTimeout(() => {
                        navigate("/login");
                    }, 3000);
                } else {
                    setStatus(data.error || "Verification failed.");
                    setStatusClass("text-red-600");
                }
            } catch {
                setStatus("Server error.");
                setStatusClass("text-red-600");
            }
        }

        verify();
    }, [params, navigate]);

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
            <h2 className="text-2xl font-semibold mb-4">Email Verification</h2>
            <p className={statusClass}>{status}</p>
        </div>
    );
};

export default VerifyEmailPage;
