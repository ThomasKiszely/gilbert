export default function NotFoundPage() {
    return (
        <div className="max-w-md mx-auto mt-20 text-center p-6">
            <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>

            <p className="text-gray-700 mb-6">
                Oops! The page you're looking for does not exist.
            </p>

            <a
                href="/"
                className="underline text-blue-600 text-lg"
            >
                ⬅️ Back to frontpage
            </a>
        </div>
    );
}
