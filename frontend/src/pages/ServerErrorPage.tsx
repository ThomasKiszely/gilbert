export default function ServerErrorPage() {
    return (
        <div className="max-w-md mx-auto mt-20 text-center p-6">
            <h1 className="text-4xl font-bold text-red-700 mb-4">500</h1>

            <p className="text-gray-700 mb-6">
                Oops... Something happened with the server.
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
