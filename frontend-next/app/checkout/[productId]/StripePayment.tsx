"use client";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import { Button } from "@/app/components/UI/button";

export default function StripePayment({ orderId }: { orderId: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Safety check to ensure Stripe is fully loaded
        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Redirect URL after successful payment
                return_url: `${window.location.origin}/order-success?orderId=${orderId}`,
            },
        });

        if (error) {
            // Stripe provides descriptive error messages in error.message
            setMessage(error.message ?? "An unexpected error occurred.");
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* PaymentElement handles credit cards, Apple Pay, etc. */}
            <PaymentElement />

            <Button
                disabled={isProcessing || !stripe || !elements}
                className="w-full bg-[#800020] hover:bg-[#600018] text-white py-6 rounded-2xl font-bold uppercase tracking-widest mt-4"
            >
                {isProcessing ? "Processing..." : "Confirm & Pay"}
            </Button>

            {message && (
                <div className="text-red-500 text-sm mt-2 font-medium">
                    {message}
                </div>
            )}
        </form>
    );
}