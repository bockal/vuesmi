CREATE TABLE `booking_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`arrival` text NOT NULL,
	`departure` text NOT NULL,
	`adults` integer NOT NULL,
	`children` integer DEFAULT 0 NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`quote_cents` integer,
	`stripe_session_id` text,
	`payment_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
