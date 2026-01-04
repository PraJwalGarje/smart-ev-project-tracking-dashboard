# smart-ev-project-tracking-dashboard

## Overview
The Smart EV Project Collaboration and Tracking Dashboard is a modern, web based application designed to streamline project management, analytics, and cross team collaboration within the Smart Electric Vehicle (EV) development lifecycle. This project addresses a common challenge in EV product development environments where multiple technical and managerial teams operate in silos. The dashboard provides a centralized platform for monitoring project health, tracking milestones, visualizing risks, and enabling data driven decision making through intuitive analytics. The system is built using React.js, styled with Tailwind CSS, and integrates interactive charts to represent project health, charging activity, and maintenance risk. It supports role based access, dark mode, and responsive design, making it suitable for both technical users and executive stakeholders.

## Project Objective
- Design a centralized dashboard for Smart EV project tracking
- Enable project managers to monitor milestones and timelines
- Provide executives with high-level analytical insights
- Allow engineers and team leads to update project progress
- Implement role-based access control for clarity and security
- Ensure full dark mode compatibility across all visual components

## System Architecture (High Level)
The application follows a modular, component-driven architecture:
- **Frontend (React.js)**
  - Component-based UI structure
  - Context API for authentication and global state
  - React Router for role-protected navigation
- **Backend Simulation**
  - JSON Server / mock API endpoints
  - Simulated project, milestone, and team datasets
- **Analytics Layer**
  - Recharts-based data visualization
  - Dynamic chart rendering driven by backend data
  - Explicit theme-safe styling for dark and light modes

## Tech Stack
- **Frontend**
  - React.js
  - React Router
  - Context API
- **Styling**
  - Tailwind CSS
  - Responsive layout utilities
  - Custom animation utilities

## Core Features

### Dashboard
- Project summary statistics
- Maintenance risk preview
- Timeline widget sourced from Reports module

### Analytics
- Project Health Trend visualization
- Charging Activity simulation
- Maintenance Risk distribution (donut chart)
- Dark mode safe charts and tooltips

### Projects
- Project creation and status tracking
- Team and milestone assignment

### Reports
- Gantt-style timeline view
- Milestone tracking and progress overview

### Teams
- Team overview and member counts
- Unified modal-based CRUD operations

### UI Enhancements
- Dark mode toggle
- Page and card level animations
- Responsive layout across devices



