CREATE TABLE `owner_auth_tokens` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `token_hash` text NOT NULL,
  `kind` text NOT NULL,
  `expires_at` text NOT NULL,
  `used_at` text,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `owner_auth_tokens_token_hash_unique` ON `owner_auth_tokens` (`token_hash`);
