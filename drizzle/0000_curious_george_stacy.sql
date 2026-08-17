CREATE TABLE `match_player_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`player_id` text NOT NULL,
	`agent` text NOT NULL,
	`acs` integer NOT NULL,
	`kills` integer NOT NULL,
	`deaths` integer NOT NULL,
	`assists` integer NOT NULL,
	`adr` real NOT NULL,
	`hs_percent` real,
	`first_kills` integer DEFAULT 0 NOT NULL,
	`first_deaths` integer DEFAULT 0 NOT NULL,
	`clutches_won` integer DEFAULT 0 NOT NULL,
	`kast_percent` real,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `match_player_unique_idx` ON `match_player_stats` (`match_id`,`player_id`);--> statement-breakpoint
CREATE INDEX `stats_match_idx` ON `match_player_stats` (`match_id`);--> statement-breakpoint
CREATE INDEX `stats_player_idx` ON `match_player_stats` (`player_id`);--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`match_date` text NOT NULL,
	`map` text NOT NULL,
	`opponent_name` text NOT NULL,
	`score_team` integer NOT NULL,
	`score_opponent` integer NOT NULL,
	`result` text NOT NULL,
	`start_side` text DEFAULT 'ATTACK' NOT NULL,
	`vod_url` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `match_date_idx` ON `matches` (`match_date`);--> statement-breakpoint
CREATE INDEX `match_map_idx` ON `matches` (`map`);--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`riot_id` text,
	`primary_role` text DEFAULT 'Flex' NOT NULL,
	`discord_id` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`discord_id` text NOT NULL,
	`username` text NOT NULL,
	`global_name` text,
	`avatar` text,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_discord_id_unique` ON `users` (`discord_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_discord_id_idx` ON `users` (`discord_id`);