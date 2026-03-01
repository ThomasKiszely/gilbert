"use client";

import { useState } from "react";
import { Gavel, AlertCircle, ArrowUp } from "lucide-react";
import { Button } from "@/app/components/UI/button";
import { Input } from "@/app/components/UI/input";

interface PlaceBidProps {
    productId: string;
    productPrice: number;
    onBidPlaced?: () => void;
}

export const PlaceBid = ({ productId, productPrice, onBidPlaced }: PlaceBidProps) => {
    const [amount, setAmount] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const minBid = Math.round(productPrice * 0.7);

    // Opdater denne del i PlaceBid.tsx
    const handleBid = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || loading) return;

        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`/api/bids/${productId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseFloat(amount) }),
            });

            // Tjek om svaret overhovedet er JSON
            const contentType = res.headers.get("content-type");
            let result;
            if (contentType && contentType.includes("application/json")) {
                result = await res.json();
            } else {
                result = { message: "Server error (Non-JSON response)" };
            }

            if (!res.ok) {
                console.error("Full Backend Error:", result);
                // Hvis result er tomt, giv en standard fejlbesked
                throw new Error(result.message || result.error || "Something went wrong on the server");
            }

            setSuccess(true);
            if (onBidPlaced) onBidPlaced();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="py-6 px-6 bg-card rounded-2xl border border-border/30 text-center animate-in fade-in zoom-in-95">
                <div className="bg-accent w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Gavel className="text-foreground h-6 w-6" />
                </div>
                <h3 className="text-foreground text-sm font-bold uppercase tracking-widest">Bid Placed!</h3>
                <p className="text-muted-foreground text-[10px] mt-1 font-mono uppercase">Opening chat...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4 text-left">
            <div className="flex items-end justify-between px-1">
                <label className="text-[12px] uppercase tracking-[0.15em] text-foreground font-black">
                    Place a bid
                </label>
                <span className="text-[10px] font-bold text-muted-foreground font-mono italic">
                    Min: {minBid} DKK
                </span>
            </div>

            <form onSubmit={handleBid} className="relative flex items-center gap-3 group">
                <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors">
                        <Gavel className="h-5 w-5" />
                    </div>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount..."
                        className="w-full bg-card border-border/50 text-foreground placeholder:text-muted-foreground h-16 pl-12 pr-16 rounded-2xl focus-visible:ring-2 focus-visible:ring-accent transition-all text-base font-bold shadow-sm outline-none border-2"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-muted-foreground uppercase font-mono">
                        DKK
                    </span>
                </div>

                <Button
                    type="submit"
                    disabled={loading || !amount}
                    className="bg-accent hover:bg-accent/80 h-16 w-16 rounded-2xl shrink-0 shadow-lg transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center p-0 border-none text-foreground"
                >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                    ) : (
                        <ArrowUp className="h-7 w-7 text-foreground stroke-[3px]" />
                    )}
                </Button>
            </form>

            {error && (
                <div className="flex items-center gap-2 text-red-400 text-[11px] font-bold bg-red-950/40 p-4 rounded-xl border border-red-800/40 animate-in slide-in-from-top-1">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}
        </div>
    );
};