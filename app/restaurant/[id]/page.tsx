"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantData = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<RestaurantData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <main className="min-h-screen bg-stone-50 text-stone-900">
        <div className="mx-auto w-full max-w-[560px] px-6 py-12">
          <p className="text-lg">Restaurant not found.</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-stone-50 text-stone-900">
        <div className="mx-auto w-full max-w-[560px] px-6 py-12">
          <p className="text-stone-500">Loading…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto w-full max-w-[560px] px-6 py-12">
        <h1 className="text-3xl font-semibold">{data.name}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {data.cuisine} · {data.area}
        </p>

        {data.totalReviews === 0 ? (
          <div className="mt-10 rounded-lg border border-stone-200 bg-white px-5 py-8 text-center">
            <p className="text-lg font-medium">No reviews yet.</p>
            <p className="mt-1 text-sm text-stone-500">Be the first to review {data.name}.</p>
            <Link
              href={`/review/${id}`}
              className="mt-4 inline-block rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white"
            >
              Write the first review
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 flex items-baseline gap-3">
              <p className="text-6xl font-semibold">{data.averageRating}</p>
              <p className="text-sm text-stone-500">
                {data.totalReviews} review{data.totalReviews === 1 ? "" : "s"}
              </p>
            </div>

            {data.latestReview && (
              <section aria-label="Latest review" className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-800">Latest review</p>
                <p className="mt-2 text-base">{data.latestReview.comment}</p>
                <p className="mt-2 text-sm text-stone-500">★ {data.latestReview.rating} / 5</p>
              </section>
            )}

            {data.reviews.length > 0 && (
              <section aria-label="Older reviews" className="mt-8">
                <h2 className="text-sm font-medium text-stone-500">Older reviews</h2>
                <ul className="mt-3 divide-y divide-stone-200 border-y border-stone-200">
                  {data.reviews.map((review) => (
                    <li key={review.id} className="py-4">
                      <p className="text-base">{review.comment}</p>
                      <p className="mt-1 text-sm text-stone-500">★ {review.rating} / 5</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Link
              href={`/review/${id}`}
              className="mt-8 inline-block rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium"
            >
              Write a review
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
