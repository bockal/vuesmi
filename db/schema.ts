import { sql } from "drizzle-orm";
import { integer,sqliteTable,text } from "drizzle-orm/sqlite-core";
export const bookingRequests=sqliteTable("booking_requests",{id:integer("id").primaryKey({autoIncrement:true}),arrival:text("arrival").notNull(),departure:text("departure").notNull(),adults:integer("adults").notNull(),children:integer("children").notNull().default(0),boatRental:integer("boat_rental",{mode:"boolean"}).notNull().default(false),pets:integer("pets").notNull().default(0),name:text("name").notNull(),email:text("email").notNull(),phone:text("phone").notNull(),note:text("note").notNull().default(""),status:text("status").notNull().default("requested"),quoteCents:integer("quote_cents"),stripeSessionId:text("stripe_session_id"),paymentUrl:text("payment_url"),cancelTokenHash:text("cancel_token_hash"),reviewSentAt:text("review_sent_at"),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)});

export const dateBlocks=sqliteTable("date_blocks",{
  id:integer("id").primaryKey({autoIncrement:true}),
  startDate:text("start_date").notNull(),
  endDate:text("end_date").notNull(),
  label:text("label").notNull().default("Owner blocked"),
  createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const pushSubscriptions=sqliteTable("push_subscriptions",{
  id:integer("id").primaryKey({autoIncrement:true}),
  ownerEmail:text("owner_email").notNull(),
  endpoint:text("endpoint").notNull().unique(),
  p256dh:text("p256dh").notNull(),
  auth:text("auth").notNull(),
  createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const ownerAuthTokens=sqliteTable("owner_auth_tokens",{
  id:integer("id").primaryKey({autoIncrement:true}),
  email:text("email").notNull(),
  tokenHash:text("token_hash").notNull().unique(),
  kind:text("kind").notNull(),
  expiresAt:text("expires_at").notNull(),
  usedAt:text("used_at"),
  createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
