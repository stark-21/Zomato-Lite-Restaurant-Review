"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ReviewPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = use(params);
  const router = useRouter();

  const [name, setName] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setName(data ? data.name : null))
      .catch(() => setName(null));
  }, [restaurantId]);

  const canSubmit = rating >= 1 && comment.trim().length > 0 && !submitting;

  async function onSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setApiError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId: Number(restaurantId), rating, comment }),
    });
    if (!res.ok) {
      // Show exactly what the backend said. No invented messages.
      const data = await res.json().catch(() => null);
      setApiError(data && data.error ? data.error : "Something went wrong.");
      setSubmitting(false);
      return;
    }
    router.push(`/restaurant/${restaurantId}`);
  }

  return (
    <main className="min-h-screen bg-white text-stone-900">
      <header className="border-b border-stone-200">
        <div className="mx-auto w-full max-w-[560px] px-6 py-3">
          <Link href={`/restaurant/${restaurantId}`} className="text-xl font-bold italic text-[#E23744]">
            zomato-lite
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[560px] px-6 py-8">
        <h1 className="text-2xl font-semibold">
          {name ? `Review ${name}` : "Write a review"}
        </h1>

        <div className="mt-8">
          <p className="text-sm font-medium">Your rating</p>
          <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Pick a rating from 1 to 5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                onClick={() => setRating(star)}
                className="rounded-md px-1 text-3xl leading-none focus:outline-2 focus:outline-[#E23744]"
              >
                <span className={star <= rating ? "text-[#E23744]" : "text-stone-300"}>
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="comment" className="text-sm font-medium">
            Your review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="What did you eat? What stood out?"
            className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base placeholder:text-stone-400 focus:border-[#E23744] focus:outline-none"
          />
        </div>

        {apiError && (
          <p role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {apiError}
          </p>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="mt-6 w-full rounded-lg bg-[#E23744] px-4 py-3 text-base font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </div>
    </main>
  );
}
