CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"product_id" integer,
	"custom_print_id" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"photo_url" text,
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image_url" text,
	"icon" text,
	"parent_id" integer,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"responded" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "custom_prints" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"material" text NOT NULL,
	"quality" text NOT NULL,
	"infill" integer NOT NULL,
	"volume" numeric(10, 2),
	"weight" numeric(10, 2),
	"print_time" integer,
	"complexity" text,
	"material_cost" numeric(10, 2),
	"print_time_cost" numeric(10, 2),
	"setup_fee" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"stl_metadata" json,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lithophanes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"image_name" text NOT NULL,
	"image_size" integer NOT NULL,
	"image_format" text NOT NULL,
	"thickness" numeric(5, 2) NOT NULL,
	"width" numeric(6, 2) NOT NULL,
	"height" numeric(6, 2) NOT NULL,
	"base_thickness" numeric(5, 2) NOT NULL,
	"material" text NOT NULL,
	"quality" text NOT NULL,
	"infill" integer NOT NULL,
	"border" boolean DEFAULT true,
	"border_width" numeric(5, 2),
	"border_height" numeric(5, 2),
	"invert_image" boolean DEFAULT false,
	"negative" boolean DEFAULT false,
	"print_time" integer,
	"material_cost" numeric(10, 2),
	"print_time_cost" numeric(10, 2),
	"setup_fee" numeric(10, 2),
	"total_cost" numeric(10, 2),
	"status" text DEFAULT 'pending' NOT NULL,
	"image_preview" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"shipping_address" text,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"image_url" text,
	"images" text[],
	"category_id" integer,
	"material" text,
	"in_stock" boolean DEFAULT true,
	"rating" numeric(2, 1) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"phone" text,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
