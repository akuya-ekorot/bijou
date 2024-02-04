ALTER TABLE "collections" ADD COLUMN "shop_id" varchar(191) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collections" ADD CONSTRAINT "collections_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
