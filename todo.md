# Multi-Database Authentication Backend - TODO

## Core Features
- [x] Database schema for database connections (name, host, port, type, credentials)
- [x] Database schema for connection logs/history
- [x] tRPC procedures for CRUD operations on database connections
- [x] Connection testing endpoint
- [x] Admin-only access control for database management
- [x] Dashboard UI with sidebar navigation
- [x] Database connections list view
- [x] Add/Edit database connection form
- [x] Connection status indicators
- [x] Test connection button functionality

## Security
- [x] Encrypted storage for database credentials
- [x] Role-based access (admin only for DB management)
- [x] Connection string validation

## Testing
- [x] Unit tests for database connection procedures
- [x] Test for admin access control

## New Features - Modular Drag & Drop Design
- [x] Dark/orange theme based on reference image
- [x] Glassmorphism effect for modules
- [x] Gradient background (dark to orange glow)
- [x] Drag-and-drop functionality for dashboard modules
- [x] Resizable module panels
- [x] Module position persistence
- [x] Extended unit tests for new features (19 tests passing)

## Design Update - KPI Cards & Grid System
- [x] KPI cards with large numbers, rounded orange borders, dark background
- [x] Minimalistic icons with reduced opacity
- [x] Grid-based layout system for modular dashboard (20px snap grid)
- [x] Test login with admin/admin credentials
- [x] Unit tests for login functionality (26 tests total, all passing)

## Major Refactor - Agent Management System

### Sticky/Snap Module System
- [x] Modules snap to each other (no overlapping)
- [x] Equal spacing between modules (gap system)
- [x] Modules cannot be placed far from others
- [x] Grid-based docking system

### Navigation Update
- [x] Remove "Modular" from navigation
- [x] Add "Agenten" page
- [x] Add "Wochenplan" page
- [x] Add "Cortex" page
- [x] Add "Prozesse" page
- [x] Add "Arbeitsplätze" (Installationen) page

### Narrative/Human Perspective
- [x] Replace technical metrics with human impact metrics
- [x] KPIs: Prozesse, Wertschöpfung (€), Zeitersparnis (h), Auslastung (%)
- [x] Agent profiles with team info

### Agent Detail View
- [x] Agent silhouette visualization
- [x] Team info (name, ID, hours per day)
- [x] Group/Context info (Region, Customer type, Project)
- [x] Workspaces list
- [x] Daily schedule with time slots
- [x] Calendar widget
- [x] TOP Skills section (coming soon placeholder)

### Global Modular Toggle
- [x] All pages get modular mechanics
- [x] Global switch for edit mode vs static mode
- [x] Consistent module behavior across all views

### Database Schema
- [x] Agents table
- [x] Processes table
- [x] Workspaces/Installations table
- [x] Teams table
- [x] Schedule/Tasks table
- [x] Cortex (knowledge base) table

### Testing
- [x] 39 unit tests passing (agents, processes, workspaces, cortex, stats, auth)

## Design Refinement - Visual Polish

### SVG Silhouette as Bar Chart
- [x] Integrate provided SVG silhouette
- [x] Implement fill-level visualization (body parts show data/utilization)
- [x] Color gradient based on utilization percentage

### Animated Background
- [x] Blurred circles animation
- [x] Gradient animation
- [x] Smooth floating effect

### Spacing and Proportions
- [x] Match reference screenshot spacing
- [x] Optimize module sizes
- [x] Fine-tune typography and padding
- [x] Consistent gap system (6px/8px grid)
