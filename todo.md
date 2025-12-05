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

## Major Update - Narrative System & Drag-and-Drop

### Narrative Seed Data
- [x] Create realistic teams (Marketing, Sales, Support, Logistik)
- [x] Create agents with names assigned to teams (Luna, Max, Sophie, Felix, Emma)
- [x] Create processes with use cases (Social Media, Email, Reporting, etc.)
- [x] Create workspaces (PCs, VMs) linked to agents
- [x] Schedule entries linking agents to processes

### Wochenplan Integration
- [x] Connect agents to weekly schedule
- [x] 24h view per agent (Tagesansicht)
- [x] Week view for complete week (Wochenansicht)
- [x] Agent selector in Wochenplan

### Modular View Edit (Drag-and-Drop)
- [x] Rename "Layout bearbeiten" to "Modular View Edit"
- [x] Edit mode toggle in sidebar
- [ ] Implement actual drag-and-drop for modules (in progress)
- [ ] Snap-to-grid functionality
- [ ] Prevent module overlap
- [ ] Save module positions

### Silhouette & Layout
- [x] Remove percentage from silhouette (colors only)
- [x] Logout button in user dropdown
- [x] Remove "Übersicht" sidebar (use KPIs instead)
- [ ] Optimize layout width (not full width)
- [ ] Add spacing to header

### Prozesse Page
- [x] Show how often each process was scheduled
- [x] Show reliability/success rate
- [x] Show which agent is currently working on which process
- [x] Move "Letzte Prozesse" to Prozesse page

### KPIs
- [x] Active agents count
- [x] Total agents count
- [x] Running processes count
- [x] Replace sidebar overview with KPI cards

### Testing
- [x] 21 unit tests passing

## UI Refinement - Apple HIG Design

### SVG Components
- [x] Agent Portrait SVG component
- [x] Team Portrait SVG component (multiple agents)
- [x] Full-body Agent Silhouette SVG (24h visualization)

### Team-Based Data
- [x] Replace agent names with team names (Marketing, Production, etc.)
- [x] Teams have 1-5 agents
- [x] Update seed data with team-centric approach

### KPI Bundling
- [x] Combine Wertschöpfung + Zeitersparnis into one KPI element
- [x] Show value creation with corresponding time savings

### Layout & Design
- [x] Add MaxWidth constraint for entire page (max-w-5xl)
- [x] Apply Apple HIG principles (minimalist, clean)
- [x] More whitespace and clearer hierarchy
- [x] Consistent spacing system

### Edit Mode
- [x] Show grips/handles on all modules when edit mode is active
- [x] Edit mode applies to all subpages
- [x] Visual feedback for draggable state

### Testing
- [x] 21 unit tests passing

## Process Status Color System & Agent Detail Fix

### Process Status Colors
- [x] Restkapazitäten: Transparent Grau-Schwarz (#1a1a1a)
- [x] Geplante Prozesse: Grauer Ton (#4a4a4a)
- [x] Neue Test Prozesse: Weiß (#ffffff)
- [x] Teilautomatisierte Prozesse: Hell-Orange (#f59e0b)
- [x] Reguläre Auslastung: Neon-Orange (#f97316)

### Silhouette Legend
- [x] Add color-coded legend next to silhouette (ProcessLegend component)
- [x] Show process type explanations on hover

### Agent Detail Page Fixes
- [x] Add MaxWidth (max-w-5xl) to agent detail page
- [x] Add bundled KPI cards to agent detail page header
- [x] Ensure consistent design with other pages
- [x] FullBodyAgent with multi-color segments based on process status
- [x] 21 unit tests passing

## Code Cleanup & GitHub Push

### Server Code Cleanup
- [x] Add JSDoc comments to server/routers.ts
- [x] Add JSDoc comments to server/db.ts
- [x] Add JSDoc comments to server/seedData.ts
- [x] Remove unused imports

### Client Code Cleanup
- [x] Document React components with JSDoc
- [x] Clean up unused imports
- [x] Add prop type documentation

### Testing
- [x] Ensure all tRPC procedures are tested (35 tests passing)
- [x] Run all tests and verify passing

### GitHub
- [ ] Push to cockpit-vibe repository
