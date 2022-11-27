CREATE TABLE "public"."days" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "date" "date",
    "notes" "text",
    "food_log" "jsonb",
    "water_log" "jsonb",
    "activity_log" "jsonb",
    "food_total" numeric,
    "water_total" numeric,
    "activity_total" numeric,
    "weight" numeric,
    "user_id" "uuid" NOT NULL
);
ALTER TABLE ONLY "public"."days"
    ADD CONSTRAINT "calendar_pkey" PRIMARY KEY ("id");
CREATE UNIQUE INDEX "days_by_user_and_date" ON "public"."days" USING "btree" ("user_id", "date");

CREATE INDEX "ix_days_user_id" ON "public"."days" USING "btree" ("user_id");

ALTER TABLE ONLY "public"."days"
    ADD CONSTRAINT "days_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");


CREATE POLICY "users can view, edit, delete own data" ON "public"."days"
AS PERMISSIVE FOR ALL
TO public
USING (uid() = user_id)
WITH CHECK (uid() = user_id)

ALTER TABLE "public"."days" ENABLE ROW LEVEL SECURITY;
