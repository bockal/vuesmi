CREATE TABLE \`push_subscriptions\` (
  \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  \`owner_email\` text NOT NULL,
  \`endpoint\` text NOT NULL,
  \`p256dh\` text NOT NULL,
  \`auth\` text NOT NULL,
  \`created_at\` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX \`push_subscriptions_endpoint_unique\` ON \`push_subscriptions\` (\`endpoint\`);
