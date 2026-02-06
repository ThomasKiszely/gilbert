'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/app/api/api";

const VerifyEmailPage = () => {
    const [status, setStatus] = useState("Verifying your email...");
    const [statusClass, setStatusClass] = useState("");

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        async function verify() {
            const token = searchParams.get("token");

            if (!token) {
                setStatus("Missing verification token.");
                setStatusClass("text-red-600 font-medium");
                return;
            }

            try {
                const res = await api(`/api/auth/verify-email?token=${token}`);
                const data = await res.json();

                if (data.success) {
                    setStatus("Your email has been verified!");
                    setStatusClass("text-green-600 font-medium");

                    setTimeout(() => {
                        router.push("/login");
                    }, 3000);
                } else {
                    setStatus(data.error || "Verification failed.");
                    setStatusClass("text-red-600 font-medium");
                }
            } catch (err) {
                setStatus("Server error.");
                setStatusClass("text-red-600 font-medium");
                console.error("Verification error:", err);
            }
        }

        verify();
    }, [searchParams, router]);

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg text-center border border-gray-100">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Email Verification</h2>
            <div className={`p-4 rounded-lg bg-gray-50 ${statusClass}`}>
                {status}
            </div>

            {status.includes("verified") && (
                <p className="mt-4 text-sm text-gray-500 italic">
                    Redirecting you to login in 3 seconds...
                </p>
            )}
        </div>
    );
};

export default VerifyEmailPage;