'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EmailChangeSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/login");
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-racing-green flex flex-col justify-center items-center px-4">

            <div className="max-w-md w-full bg-ivory-dark p-12 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-racing-green/5 text-center">


                <div className="w-20 h-20 bg-racing-green rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <svg
                        className="w-10 h-10 text-ivory"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-serif font-bold text-racing-green mb-4 uppercase tracking-tighter">
                    Email Updated
                </h1>

                <p className="text-racing-green/70 font-medium mb-10 leading-relaxed">
                    Your email has been successfully changed. <br />
                    You will be redirected to the login page shortly to verify your new credentials.
                </p>

                {/* Progress bar der viser ventetiden luksuriøst */}
                <div className="relative w-full h-1 bg-racing-green/10 rounded-full overflow-hidden mb-8">
                    <div className="absolute top-0 left-0 h-full bg-racing-green animate-[loading_5s_linear_forwards]" />
                </div>

                <p className="text-[10px] text-racing-green/40 uppercase tracking-[0.2em] font-bold">
                    Redirecting in 5 seconds...
                </p>

                <div className="mt-8 pt-6 border-t border-racing-green/5">
                    <Link
                        href="/login"
                        className="text-sm font-bold text-racing-green uppercase tracking-widest hover:opacity-60 transition-opacity underline decoration-1 underline-offset-4"
                    >
                        Click here to go now
                    </Link>
                </div>
            </div>

            {/* Global animation til progress baren */}
            <style jsx global>{`
                @keyframes loading {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
}