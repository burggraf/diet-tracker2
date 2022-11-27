CREATE TABLE "public"."food" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text",
    "portion" "text",
    "calories" numeric
);
COMMENT ON TABLE "public"."food" IS 'food calories database';

ALTER TABLE ONLY "public"."food"
    ADD CONSTRAINT "food_pkey" PRIMARY KEY ("id");
