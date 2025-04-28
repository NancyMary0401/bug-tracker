# Bug Tracker Application

A modern bug tracking application built with Next.js to help teams manage, track, and resolve software issues efficiently.

## Features

- **User Authentication**: Login with role-based access (Manager/Developer)
- **Dashboard**: View bug statistics, recent activity, and trends
- **Bug Management**: Create, update, and track bugs
- **Task Status**: Track bugs through their lifecycle (Open, In Progress, Closed)
- **Time Tracking**: Log work time on tasks
- **Responsive Design**: Works on all devices

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) with App Router
- **Styling**: CSS Modules
- **Charts**: Chart.js
- **Font**: Geist Sans from Google Fonts

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/bug-tracker.git
cd bug-tracker
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Usage

### Login Credentials

The application includes some sample users for testing:

- **Developer Role**:
  - Username: `devuser`, Password: `devpass`
  - Username: `alice`, Password: `alicepass`
  - Username: `bob`, Password: `bobpass`
  
- **Manager Role**:
  - Username: `manageruser`, Password: `managerpass`
  - Username: `eve`, Password: `evepass`

### Application Flow

1. Log in with one of the provided credentials
2. View the dashboard with bug statistics and trends
3. Create new bugs or update existing ones
4. Track time spent on bugs
5. Change bug status as they progress through the workflow

## Project Structure

The application follows a modular structure based on Next.js best practices:

- `src/app`: Next.js App Router pages and layouts
  - `dashboard/`: Dashboard page and story subpage
    - `page.js`: Dashboard main page
    - `story/page.js`: Dashboard story subpage
  - `login/`: Login page
    - `page.js`: Login page
    - `login.module.css`: Login page styles
  - `layout.js`: Root layout
  - `page.js`: Root landing page
  - `globals.css`, `page.module.css`: Global and landing page styles
- `src/components`: Reusable React components
  - `common/`: Shared components (e.g., `Header.js`)
  - `dashboard/`: Dashboard-specific components (e.g., `TaskTrendLine.js`, `DashboardStats.js`, `SidePanel.js`, `TaskTable.js`)
  - `ui/`: Reusable UI components (e.g., `Toast.js`, `ConfirmDialog.js`, `TimeLoggingModal.js`)
  - `auth/`: Authentication-related components (e.g., `LoginContent.js`)
- `src/context`: React context providers (e.g., `UserContext.js`)
- `src/lib`: Library code and utilities
  - `data/`: Mock and static data (e.g., `mockTasks.js`)
  - `services/`: Service integrations (e.g., `authService.js`)
  - `constants/`: App-wide constants (e.g., `status.js`)
  - `utils/`: Utility functions (e.g., `date.js`)
- `src/models`: Data models (e.g., `users.js`)
- `src/pages`: (Empty or legacy, not used with App Router)

## Dashboard Component: TaskTrendLine

The `TaskTrendLine` component is a key part of the dashboard, providing a visual representation of task trends over the past 7 days. It uses Chart.js to display a line chart with the following features:

- **Total Tasks**: Shows the cumulative number of tasks up to each day.
- **In Progress**: Displays the number of tasks currently in progress for each day.
- **Completed**: Indicates the number of tasks completed or closed by each day.

### Role-Based Filtering
- **Manager**: Sees trends for all tasks in the system.
- **Developer**: Sees trends only for tasks assigned to them.

### Data Requirements
- The component expects a `tasks` array, a `role` string, and a `username` string as props.
- Each task should have at least the following fields: `createdAt` (or `created_at`), `status`, `assignee`, and `lastUpdated` (or `updatedAt`/`updated_at`).

### Chart Features
- Responsive and mobile-friendly
- Interactive tooltips and legend
- Color-coded lines for each task status

### No Data State
If there are no tasks, the component displays a friendly message prompting users to create tasks to see trends.

You can find the implementation in `src/components/dashboard/TaskTrendLine.js`.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Icons from Heroicons
- UI inspiration from modern issue trackers like Jira and Linear
