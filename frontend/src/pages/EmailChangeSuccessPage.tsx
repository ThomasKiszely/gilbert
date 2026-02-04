import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EmailChangeSuccessPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/login");
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="max-w-md mx-auto mt-20 text-center p-6">
            <h1 className="text-2xl font-bold text-green-700 mb-4">
                Your email is now changed
            </h1>

            <p className="text-gray-700 mb-6">
                You will automatically be redirected in a moment.
            </p>

            <p className="text-sm text-gray-500">
                If you are not redirected you can{" "}
                <a href="/login" className="underline text-blue-600">
                    click here
                </a>.
            </p>
        </div>
    );
}
