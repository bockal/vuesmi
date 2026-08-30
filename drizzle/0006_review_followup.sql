ALTER TABLE `booking_requests` ADD `review_sent_at` text;
--> statement-breakpoint
UPDATE `booking_requests` SET `review_sent_at` = CURRENT_TIMESTAMP WHERE `departure` < date('now');

