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

```
/bug-tracker
├── public/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── globals.css
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── page.module.css
│   ├── components/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── dashboard/
│   │   └── ui/
│   ├── context/
│   ├── lib/
│   │   ├── data/
│   │   ├── services/
│   │   ├── constants/
│   │   └── utils/
│   ├── models/
│   └── pages/
├── .gitignore
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package-lock.json
├── package.json
└── README.md
```

## Dashboard Component: TaskTrendLine

The `TaskTrendLine` component is a key part of the dashboard, providing a visual representation of task trends over the past 7 days. It uses Chart.js to display a line chart with the following features:

- **Total Tasks**: Shows the cumulative number of tasks up to each day.
- **In Progress**: Displays the number of tasks currently in progress for each day.
- **Completed**: Indicates the number of tasks completed or closed by each day.

### Role-Based Filtering
- **Manager**: Sees trends for all tasks in the system.
- **Developer**: Sees trends only for tasks assigned to them.
