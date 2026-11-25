CREATE TYPE "otp_type" AS ENUM('signup', 'reset-password');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('admin', 'super_admin', 'user', 'moderator');--> statement-breakpoint
CREATE TYPE "user_status" AS ENUM('pending', 'active', 'blocked', 'deactivated');--> statement-breakpoint
CREATE TABLE "otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL UNIQUE,
	"type" "otp_type" NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"phone" varchar(20) NOT NULL UNIQUE,
	"password_hash" text NOT NULL,
	"profile_image" text,
	"role" "user_role" DEFAULT 'user'::"user_role" NOT NULL,
	"status" "user_status" DEFAULT 'pending'::"user_status" NOT NULL,
	"is_otp_verified" boolean DEFAULT false NOT NULL,
	"is_two_factor_enabled" boolean DEFAULT false NOT NULL,
	"blocked_reason" varchar(255),
	"deletion_reason" varchar(255),
	"verified_at" timestamp with time zone,
	"blocked_at" timestamp with time zone,
	"last_login" timestamp with time zone,
	"last_activity" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Dhaka' NOT NULL
);
--> statement-breakpoint
CREATE INDEX "otp_user_index" ON "otps" ("user_id");--> statement-breakpoint
CREATE INDEX "role" ON "users" ("role");--> statement-breakpoint
CREATE INDEX "status" ON "users" ("status");--> statement-breakpoint
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE;