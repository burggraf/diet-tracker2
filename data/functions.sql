DROP FUNCTION IF EXISTS "public"."search_food_log";
CREATE OR REPLACE FUNCTION "public"."search_food_log"(string text)
  RETURNS TABLE(title text, calories numeric, "desc" text) LANGUAGE sql AS $$
  select * from 
  (
  select distinct
    jsonb_array_elements(food_log->'entries')->>'title' as title, 
    (jsonb_array_elements(food_log->'entries')->'cps')::numeric as calories,
    jsonb_array_elements(food_log->'entries')->>'desc' as "desc"
  from days
  ) as days_query
  where title ilike '%' || string || '%'
  order by title
$$;

DROP FUNCTION IF EXISTS "public"."next_free_day";
CREATE OR REPLACE FUNCTION "public"."next_free_day"()
  RETURNS text LANGUAGE sql AS $$
  select substring(cast((max(date) + INTERVAL '1 days') as text),1,10) as next_free_day from days
$$;

DROP FUNCTION IF EXISTS "public"."get_calorie_totals";
CREATE OR REPLACE FUNCTION "public"."get_calorie_totals"(start_date date, end_date date)
  RETURNS TABLE(date date, value numeric) LANGUAGE sql AS $$
  with data as (
    select 
      date,
      (jsonb_array_elements(food_log->'entries')->'amt')::integer as calories
    from days /*where user_id = 'xxxx'*/ where date between start_date and end_date
  ) select date, sum(calories) as value from data group by date order by date;
$$;

DROP FUNCTION IF EXISTS "public"."get_weights";
CREATE OR REPLACE FUNCTION "public"."get_weights"(start_date date, end_date date)
  RETURNS TABLE(date date, value numeric) LANGUAGE sql AS $$
    select 
      date, weight as value
    from days /*where user_id = 'xxxx'*/ 
    where date between start_date and end_date
$$;
