import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

type ReviewRow = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const restaurantId = Number(id);
  if (!Number.isInteger(restaurantId)) {
    return Response.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const sql = getSql();

  const restaurants = await sql.query(`SELECT id, name, cuisine, area FROM restaurants WHERE id = $1`, [
    restaurantId,
  ]);
  if (restaurants.length === 0) {
    return Response.json({ error: "Restaurant not found." }, { status: 404 });
  }
  const restaurant = restaurants[0] as { id: number; name: string; cuisine: string; area: string };

  // The intelligence: AVG and COUNT run fresh on every page load.
  const stats = await sql.query(
    `SELECT AVG(rating)::float AS avg_rating, COUNT(*)::int AS total FROM reviews WHERE restaurant_id = $1`,
    [restaurantId]
  );
  const { avg_rating, total } = stats[0] as { avg_rating: number | null; total: number };

  const rows = (await sql.query(
    `SELECT id, rating, comment, created_at FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC`,
    [restaurantId]
  )) as unknown as ReviewRow[];

  const toReview = (r: ReviewRow) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: new Date(r.created_at).toISOString(),
  });

  // "What happens when there is nothing yet": null average, zero count,
  // null latest, empty list — so the frontend can show an invite instead of maths.
  if (rows.length === 0) {
    return Response.json({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      area: restaurant.area,
      averageRating: null,
      totalReviews: 0,
      latestReview: null,
      reviews: [],
    });
  }

  const [latest, ...rest] = rows;
  const averageRating = avg_rating === null ? null : Math.round(avg_rating * 10) / 10;

  return Response.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating,
    totalReviews: total,
    latestReview: toReview(latest),
    reviews: rest.map(toReview),
  });
}
