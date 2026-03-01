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
        setErrorMessage("");

        const cardElement = elements.getElement(CardElement);

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement!,
            },
        });

        if (result.error) {
            setErrorMessage(result.error.message || "Payment failed.");
            setLoading(false);
            return;
        }

        if (result.paymentIntent?.status === "succeeded") {
            router.push(`/orders/success?orderId=${orderId}`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 border border-zinc-200 rounded-xl bg-white shadow-sm">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: "16px",
                                color: "#000",
                                "::placeholder": { color: "#999" },
                            },
                            invalid: { color: "#e5424d" },
                        },
                    }}
                />
            </div>

            {errorMessage && (
                <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
            )}

            <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-black hover:bg-zinc-900 text-white py-6 rounded-2xl text-lg font-bold transition-all"
            >
                {loading ? "Processing..." : "Pay Now"}
            </Button>
        </div>
    );
}
