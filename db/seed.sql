-- Seed: one restaurant + three reviews, spaced days apart so "latest" is meaningful.
INSERT INTO restaurants (id, name, cuisine, area)
VALUES (1, 'Ludhiana Burrito', 'Indian', 'Sector 32')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, cuisine = EXCLUDED.cuisine, area = EXCLUDED.area;

-- Clear old reviews for restaurant 1 so re-running the script gives the same 3 rows.
DELETE FROM reviews WHERE restaurant_id = 1;

INSERT INTO reviews (restaurant_id, rating, comment, created_at)
VALUES
  (1, 5, 'Paneer burrito is unreal', NOW() - INTERVAL '8 days'),
  (1, 4, 'Good, but slow service', NOW() - INTERVAL '6 days'),
  (1, 4, 'Solid. Would repeat.', NOW() - INTERVAL '2 days');
