CREATE TYPE "brand_status" AS ENUM('draft', 'active', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "display_type" AS ENUM('text', 'color_swatch', 'image_swatch');--> statement-breakpoint
CREATE TYPE "product_status" AS ENUM('draft', 'active', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "media_status" AS ENUM('pending', 'attached');--> statement-breakpoint
CREATE TYPE "discount_type" AS ENUM('FIXED_AMOUNT', 'PERCENTAGE');--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');--> statement-breakpoint
CREATE TYPE "payment_method" AS ENUM('cod', 'bkash_manual', 'nagad_manual', 'rocket_manual', 'bank_transfer');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('unpaid', 'pending_verification', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "setting_type" AS ENUM('light_theme', 'dark_theme', 'site_meta', 'social_links', 'contact_info', 'shipping_charge');--> statement-breakpoint
CREATE TABLE "addresses" (
	"address_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid,
	"phone_number" varchar,
	"address_line_1" varchar(500) NOT NULL,
	"address_line_2" varchar(500),
	"postal_code" varchar(4) NOT NULL,
	"city" varchar(50) NOT NULL,
	"state" varchar(50) NOT NULL,
	"country" varchar(50) DEFAULT 'bangladesh' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"brand_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"description" text,
	"image_url" text,
	"image_alt_text" varchar(120),
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"status" "brand_status" DEFAULT 'draft'::"brand_status" NOT NULL,
	"meta_title" varchar(100),
	"meta_description" varchar(180),
	"og_image_url" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attributes" (
	"attribute_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL UNIQUE,
	"display_type" "display_type" NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attribute_values" (
	"attribute_value_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"attribute_id" uuid,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL UNIQUE,
	"color_hex" varchar(20),
	"image_url" text,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"category_id" uuid NOT NULL,
	"attribute_id" uuid NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_filterable" boolean DEFAULT true NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"product_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_by" uuid,
	"title" varchar(255) NOT NULL,
	"slug" varchar(280) NOT NULL UNIQUE,
	"short_description" varchar(500),
	"description" text,
	"category_id" uuid NOT NULL,
	"brand_id" uuid,
	"thumbnail_url" text,
	"thumbnail_alt_text" varchar(255),
	"base_price" numeric(12,2) NOT NULL,
	"compare_at_price" numeric(12,2),
	"has_variants" boolean DEFAULT false NOT NULL,
	"specifications" jsonb,
	"product_status" "product_status" DEFAULT 'draft'::"product_status" NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"avg_rating" numeric(3,2) DEFAULT '0.00' NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"total_sold" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"meta_title" varchar(100),
	"meta_description" varchar(180),
	"og_image_url" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"variant_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" uuid NOT NULL,
	"sku" varchar(100) NOT NULL UNIQUE,
	"barcode" varchar(100),
	"title" varchar(255),
	"price" numeric(12,2) NOT NULL,
	"original_price" numeric(12,2),
	"cost_price" numeric(12,2) NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 5 NOT NULL,
	"weight_grams" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "variant_stock_non_negative" CHECK ("stock_quantity" >= 0),
	CONSTRAINT "variant_wight_grams_non_negative" CHECK ("weight_grams" >= 0)
);
--> statement-breakpoint
CREATE TABLE "variant_attribute_values" (
	"variant_attribute_value_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"variant_id" uuid NOT NULL,
	"attribute_value_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"image_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_id" uuid NOT NULL,
	"variant_id" uuid,
	"image_url" text NOT NULL,
	"public_id" varchar(255) NOT NULL,
	"alt_text" varchar(255),
	"is_primary" boolean DEFAULT false NOT NULL,
	"display_order" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_uploads" (
	"media_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"uploaded_by" uuid,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"public_id" varchar NOT NULL,
	"status" "media_status" DEFAULT 'pending'::"media_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"banner_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"title" varchar(255) NOT NULL,
	"image_url" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"coupon_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" varchar(50) NOT NULL UNIQUE,
	"discount_value" numeric(12,2) NOT NULL,
	"discount_type" "discount_type" NOT NULL,
	"max_discount_amount" numeric(12,2) NOT NULL,
	"min_order_amount" numeric(12,2) NOT NULL,
	"starts_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"usage_limit" integer DEFAULT 0 NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"per_user_limit" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupon_usages" (
	"code_usages_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"coupon_id" uuid NOT NULL,
	"user_id" uuid,
	"order_id" uuid NOT NULL,
	"guest_phone" varchar(20),
	"discount_amount" numeric(12,2) NOT NULL,
	"used_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"cart_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid,
	"session_token" varchar(255),
	"coupon_id" uuid,
	"discount_amount" numeric(12,2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"cart_item_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"cart_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"order_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_number" varchar NOT NULL UNIQUE,
	"user_id" uuid,
	"coupon_id" uuid,
	"address_id" uuid,
	"customer_name" varchar(255),
	"customer_email" varchar(255),
	"customer_phone" varchar(20),
	"shipping_address" text NOT NULL,
	"subtotal" numeric(12,2) NOT NULL,
	"discount_amount" numeric(12,2) DEFAULT '0' NOT NULL,
	"delivery_charge" numeric(12,2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(12,2) NOT NULL,
	"order_status" "order_status" DEFAULT 'pending'::"order_status" NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"payment_status" "payment_status" DEFAULT 'unpaid'::"payment_status" NOT NULL,
	"manual_trx_id" varchar(100),
	"manual_sender_number" varchar(20),
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"order_items" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"variant_id" uuid,
	"product_title" varchar(255) NOT NULL,
	"variant_sku" varchar(100) NOT NULL,
	"attribute_summary" jsonb NOT NULL,
	"unit_price" numeric(12,2) NOT NULL,
	"quantity" integer NOT NULL,
	"line_total" numeric(12,2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"setting_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"key" "setting_type" NOT NULL UNIQUE,
	"value" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "brand_status_index" ON "brands" ("status");--> statement-breakpoint
CREATE INDEX "brand_is_featured" ON "brands" ("is_featured");--> statement-breakpoint
CREATE UNIQUE INDEX "category_attribute_unique_idx" ON "category_attributes" ("category_id","attribute_id");--> statement-breakpoint
CREATE INDEX "category_attribute_attr_id_idx" ON "category_attributes" ("attribute_id");--> statement-breakpoint
CREATE INDEX "product_created_by_index" ON "products" ("created_by");--> statement-breakpoint
CREATE INDEX "product_status_index" ON "products" ("product_status");--> statement-breakpoint
CREATE INDEX "product_is_featured_index" ON "products" ("is_featured");--> statement-breakpoint
CREATE INDEX "product_price_index" ON "products" ("base_price");--> statement-breakpoint
CREATE INDEX "variant_product_id_index" ON "variants" ("product_id");--> statement-breakpoint
CREATE INDEX "variant_is_active_index" ON "variants" ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "variant_one_default_per_product_idx" ON "variants" ("product_id") WHERE "is_default" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "variant_attribute_value_unique_idx" ON "variant_attribute_values" ("variant_id","attribute_value_id");--> statement-breakpoint
CREATE INDEX "vav_attribute_value_id_idx" ON "variant_attribute_values" ("attribute_value_id");--> statement-breakpoint
CREATE INDEX "product_images_product_id_index" ON "product_images" ("product_id");--> statement-breakpoint
CREATE INDEX "product_images_variant_id_index" ON "product_images" ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_images_one_primary_per_product_idx" ON "product_images" ("product_id") WHERE "is_primary" = true;--> statement-breakpoint
CREATE INDEX "media_status_created_at_idx" ON "media_uploads" ("status","created_at");--> statement-breakpoint
CREATE INDEX "media_product_idx" ON "media_uploads" ("product_id");--> statement-breakpoint
CREATE INDEX "coupons_code_idx" ON "coupons" ("code");--> statement-breakpoint
CREATE INDEX "coupons_starts_at_expires_at" ON "coupons" ("starts_at","expires_at");--> statement-breakpoint
CREATE INDEX "coupons_is_active" ON "coupons" ("is_active");--> statement-breakpoint
CREATE INDEX "coupon_usages_coupon_id_idx" ON "coupon_usages" ("coupon_id");--> statement-breakpoint
CREATE INDEX "coupon_usages_user_id_idx" ON "coupon_usages" ("user_id");--> statement-breakpoint
CREATE INDEX "coupon_usages_guest_phone_idx" ON "coupon_usages" ("guest_phone");--> statement-breakpoint
CREATE INDEX "coupon_usages_order_id_idx" ON "coupon_usages" ("order_id");--> statement-breakpoint
CREATE INDEX "cart_user_idx" ON "carts" ("user_id");--> statement-breakpoint
CREATE INDEX "cart_session_token_idx" ON "carts" ("session_token");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_variant_unique_index" ON "cart_items" ("cart_id","variant_id");--> statement-breakpoint
CREATE INDEX "order_item_order_idx" ON "order_items" ("order_id");--> statement-breakpoint
CREATE INDEX "order_item_variant_idx" ON "order_items" ("variant_id");--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attribute_id_attributes_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("attribute_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_category_id_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_attribute_id_attributes_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("attribute_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_users_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("brand_id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "variant_attribute_values" ADD CONSTRAINT "variant_attribute_values_variant_id_variants_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variants"("variant_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "variant_attribute_values" ADD CONSTRAINT "variant_attribute_values_8hNIxLoueGpH_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_values"("attribute_value_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_variant_id_variants_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variants"("variant_id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media_uploads" ADD CONSTRAINT "media_uploads_uploaded_by_users_user_id_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("user_id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media_uploads" ADD CONSTRAINT "media_uploads_product_id_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_coupon_id_coupons_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("coupon_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "coupon_usages" ADD CONSTRAINT "coupon_usages_order_id_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_coupon_id_coupons_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("coupon_id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("cart_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_variants_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variants"("variant_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_coupons_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("coupon_id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_addresses_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("address_id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_variants_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variants"("variant_id") ON DELETE SET NULL;