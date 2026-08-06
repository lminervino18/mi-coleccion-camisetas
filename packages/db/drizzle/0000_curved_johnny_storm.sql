CREATE TYPE "public"."image_upload_status" AS ENUM('pending', 'confirmed');--> statement-breakpoint
CREATE TYPE "public"."shirt_color" AS ENUM('white', 'black', 'red', 'blue', 'lightBlue', 'navy', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'grey', 'gold', 'silver');--> statement-breakpoint
CREATE TYPE "public"."shirt_kind" AS ENUM('club', 'national');--> statement-breakpoint
CREATE TYPE "public"."shirt_kit" AS ENUM('home', 'away', 'third', 'goalkeeper', 'special');--> statement-breakpoint
CREATE TYPE "public"."shirt_size" AS ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL');--> statement-breakpoint
CREATE TABLE "image_uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"object_key" text NOT NULL,
	"content_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"status" "image_upload_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "share_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shirt_colors" (
	"shirt_id" uuid NOT NULL,
	"color" "shirt_color" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shirts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" "shirt_kind" NOT NULL,
	"club" text,
	"league" text,
	"country" text NOT NULL,
	"season" text NOT NULL,
	"kit" "shirt_kit" NOT NULL,
	"size" "shirt_size" NOT NULL,
	"player_name" text,
	"squad_number" smallint,
	"notes" text,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"image_key" text NOT NULL,
	"image_width" integer NOT NULL,
	"image_height" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text,
	"avatar_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "image_uploads" ADD CONSTRAINT "image_uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shirt_colors" ADD CONSTRAINT "shirt_colors_shirt_id_shirts_id_fk" FOREIGN KEY ("shirt_id") REFERENCES "public"."shirts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shirts" ADD CONSTRAINT "shirts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "image_uploads_object_key_idx" ON "image_uploads" USING btree ("object_key");--> statement-breakpoint
CREATE INDEX "image_uploads_status_created_at_idx" ON "image_uploads" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_hash_idx" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_idx" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "share_links_token_hash_idx" ON "share_links" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "share_links_user_id_idx" ON "share_links" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shirt_colors_shirt_id_color_idx" ON "shirt_colors" USING btree ("shirt_id","color");--> statement-breakpoint
CREATE INDEX "shirt_colors_color_idx" ON "shirt_colors" USING btree ("color");--> statement-breakpoint
CREATE INDEX "shirts_user_id_created_at_idx" ON "shirts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "shirts_user_id_position_idx" ON "shirts" USING btree ("user_id","position");--> statement-breakpoint
CREATE INDEX "shirts_user_id_country_idx" ON "shirts" USING btree ("user_id","country");--> statement-breakpoint
CREATE INDEX "shirts_user_id_league_idx" ON "shirts" USING btree ("user_id","league");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_lower_idx" ON "users" USING btree (lower("username"));--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");