import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EmailChangeErrorPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/login");
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="max-w-md mx-auto mt-20 text-center p-6">
            <h1 className="text-2xl font-bold text-red-700 mb-4">
                Could not change email
            </h1>

            <p className="text-gray-700 mb-6">
                The link is not valid, or the email is already in use.
            </p>

            <p className="text-sm text-gray-500">
                You will automatically be redirected in a moment.
            </p>

            <p className="text-sm text-gray-500 mt-2">
                If you are not redirected you can{" "}
                <a href="/login" className="underline text-blue-600">
                    click here
                </a>.
            </p>
        </div>
    );
}
