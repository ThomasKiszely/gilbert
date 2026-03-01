'use client';

import React, { useState, ChangeEvent } from 'react';
import { Star } from 'lucide-react';
import { api } from '@/app/api/api';

interface OrderRatingProps {
    orderId: string;
    onSuccess: () => void;
}

export default function OrderRating({ orderId, onSuccess }: OrderRatingProps) {
    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleSubmit = async (): Promise<void> => {
        if (rating === 0) {
            setError("Please select a rating.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await api(`/api/reviews/${orderId}`, {
                method: 'POST',
                body: JSON.stringify({ rating, comment })
            });

            const data: any = await res.json();

            if (data.success) {
                onSuccess();
            } else {
                setError(data.message || "Something went wrong.");
            }
        } catch (err: unknown) {
            setError("Failed to submit review.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        /* Opdateret til mørkt tema: bg-white/5 og hvid tekst */
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] mt-8 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className="font-serif font-black italic text-2xl text-white mb-2">Rate this transaction</h3>
            <p className="text-[10px] text-zinc-400 mb-6 uppercase tracking-[0.2em] font-bold">How was your experience with the seller?</p>

            <div className="flex gap-3 mb-8">
                {[1, 2, 3, 4, 5].map((star: number) => (
                    <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-125 active:scale-90 outline-none"
                    >
                        <Star
                            size={36}
                            className={`${
                                (hover || rating) >= star
                                    ? 'fill-burgundy text-burgundy' // Bruger din 'burgundy' accent farve
                                    : 'text-zinc-800'
                            } transition-colors cursor-pointer`}
                        />
                    </button>
                ))}
            </div>

            <textarea
                value={comment}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
                placeholder="Write a comment (optional)..."
                /* Mørk textarea styling */
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm text-white focus:outline-none focus:border-burgundy h-28 mb-6 italic font-serif resize-none shadow-inner"
            />

            {error && <p className="text-burgundy text-[10px] font-black uppercase mb-4 tracking-widest">{error}</p>}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
                /* Knappen matcher nu 'Submit' stilen fra resten af siden */
                className="bg-burgundy text-white px-12 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:brightness-125 disabled:opacity-50 transition-all shadow-lg shadow-burgundy/20"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </div>
    );
}