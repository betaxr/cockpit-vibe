CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`agentId` varchar(64) NOT NULL,
	`teamId` int,
	`hoursPerDay` int NOT NULL DEFAULT 24,
	`status` enum('active','idle','offline','busy') NOT NULL DEFAULT 'idle',
	`avatarColor` varchar(32) DEFAULT '#f97316',
	`skills` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_agentId_unique` UNIQUE(`agentId`)
);
--> statement-breakpoint
CREATE TABLE `cortex_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`category` varchar(128),
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cortex_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','running','completed','failed','paused') NOT NULL DEFAULT 'pending',
	`agentId` int,
	`workspaceId` int,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`startTime` timestamp,
	`endTime` timestamp,
	`durationMinutes` int,
	`valueGenerated` int DEFAULT 0,
	`timeSavedMinutes` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `processes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schedule_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`processId` int,
	`title` varchar(255) NOT NULL,
	`date` date NOT NULL,
	`startHour` int NOT NULL,
	`endHour` int NOT NULL,
	`color` varchar(32) DEFAULT '#f97316',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `schedule_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`teamId` varchar(64) NOT NULL,
	`region` varchar(128),
	`customerType` varchar(128),
	`project` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`),
	CONSTRAINT `teams_teamId_unique` UNIQUE(`teamId`)
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('pc','vm','server','cloud') NOT NULL DEFAULT 'pc',
	`status` enum('online','offline','maintenance') NOT NULL DEFAULT 'offline',
	`agentId` int,
	`ipAddress` varchar(64),
	`lastActiveAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`)
);
