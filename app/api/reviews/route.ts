import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const { restaurantId, rating, comment } = body as {
    restaurantId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  // Check 1: rating is a whole number from 1 to 5.
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: "Rating must be a whole number between 1 and 5." }, { status: 400 });
  }

  // Check 2: comment is non-empty after trimming.
  if (typeof comment !== "string" || comment.trim().length === 0) {
    return Response.json({ error: "Comment must not be empty." }, { status: 400 });
  }

  // Check 3: the restaurant actually exists (a database lookup).
  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId)) {
    return Response.json({ error: "Restaurant does not exist." }, { status: 400 });
  }

  const sql = getSql();
  const existing = await sql.query(`SELECT id FROM restaurants WHERE id = $1`, [restaurantId]);
  if (existing.length === 0) {
    return Response.json({ error: "Restaurant does not exist." }, { status: 400 });
  }

  const inserted = await sql.query(
    `INSERT INTO reviews (restaurant_id, rating, comment) VALUES ($1, $2, $3) RETURNING id`,
    [restaurantId, rating, (comment as string).trim()]
  );
  const reviewId = (inserted[0] as { id: number }).id;

  return Response.json({ success: true, reviewId }, { status: 201 });
}
