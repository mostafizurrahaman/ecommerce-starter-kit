CREATE TYPE "category_status" AS ENUM('active', 'inactive', 'archived');--> statement-breakpoint
CREATE TABLE "categories" (
	"category_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"parent_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"slug" varchar(255) NOT NULL UNIQUE,
	"image_url" text,
	"image_alt_text" varchar(255),
	"depth" smallint DEFAULT 1 NOT NULL,
	"status" "category_status" DEFAULT 'active'::"category_status" NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"meta_title" varchar(100),
	"meta_description" varchar(180),
	"og_image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "category_parent_id_index" ON "categories" ("parent_id");--> statement-breakpoint
CREATE INDEX "category_status_index" ON "categories" ("status");--> statement-breakpoint
CREATE INDEX "category_display_order_index" ON "categories" ("display_order");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_category_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT;