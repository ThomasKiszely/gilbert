export default function TermsPage() {
    return (
        <div className="max-w-2xl mx-auto mt-20 p-8 bg-ivory-dark rounded-xl shadow-lg text-burgundy">
            <h1 className="text-2xl font-bold mb-6">Terms & Conditions</h1>
            <div className="prose prose-sm text-burgundy space-y-4">
                <p><strong>Version 1.0.0</strong></p>
                <p>Her indsætter du dine fulde terms-tekster...</p>
                {/* Tilføj alt dit indhold her */}
            </div>
            <div className="mt-8">
                <a href="/login" className="text-racing-green underline">
                    Back to Login
                </a>
            </div>
        </div>
    );
}