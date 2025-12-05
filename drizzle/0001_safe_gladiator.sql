CREATE TABLE `connection_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`userId` int NOT NULL,
	`action` enum('connect','disconnect','query','test') NOT NULL,
	`success` int NOT NULL DEFAULT 1,
	`errorMessage` text,
	`durationMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `connection_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `database_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`dbType` enum('mysql','postgres','mongodb','redis','sqlite') NOT NULL,
	`host` varchar(255) NOT NULL,
	`port` int NOT NULL,
	`database` varchar(255),
	`username` varchar(255),
	`encryptedPassword` text,
	`sslEnabled` int NOT NULL DEFAULT 0,
	`status` enum('active','inactive','error','unknown') NOT NULL DEFAULT 'unknown',
	`lastConnectedAt` timestamp,
	`lastError` text,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `database_connections_id` PRIMARY KEY(`id`)
);
