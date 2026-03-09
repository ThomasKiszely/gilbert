"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/app/components/UI/button";

export default function StripePayment({
                                          orderId,
                                          clientSecret
                                      }: {
    orderId: string;
    clientSecret: string;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handlePayment = async () => {
        if (!stripe || !elements) return;

        setLoading(true);
        setErrorMessage(""); // Nulstil fejl

        const cardElement = elements.getElement(CardElement);

        // Stripe bekræftelse
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: cardElement! },
        });

        // Uanset om Stripe brokker sig lidt over "capture_method: manual"
        // (hvilket de ofte gør), så tjek om vi har en PaymentIntent
        if (result.paymentIntent || !result.error) {
            // Vi stoler 100% på vores backend-webhook
            window.location.href = `/orders/success?orderId=${orderId}`;
        } else {
            // Vis kun fejl, hvis det er en reel kort-afvisning
            setErrorMessage(result.error?.message || "Betalingen kunne ikke gennemføres.");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stripe Card Element container */}
            <div className="p-5 border border-zinc-200 rounded-2xl bg-zinc-50 shadow-inner">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: "16px",
                                color: "#000",
                                fontFamily: "sans-serif",
                                "::placeholder": { color: "#999" },
                            },
                            invalid: { color: "#e5424d" },
                        },
                    }}
                />
            </div>

            {/* Fejlbesked */}
            {errorMessage && (
                <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100">
                    {errorMessage}
                </p>
            )}

            {/* Betalingsknap */}
            <Button
                onClick={handlePayment}
                disabled={loading || !stripe}
                className="w-full bg-[#003d2b] hover:bg-[#002a1e] text-white py-6 rounded-2xl text-md font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
            >
                {loading ? "Processing..." : "Pay Now"}
            </Button>
        </div>
    );
}