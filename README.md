# Bug Tracker

A comprehensive task and bug tracking application built with Next.js, designed to help development teams manage their projects efficiently. The application allows users to create, track, and manage tasks with an intuitive user interface and role-based permissions system.

## Features

- **User Authentication**: Secure login with role-based access (Developer, Manager, Tester)
- **Task Management**: Create, view, edit, and delete tasks/bugs
- **Advanced Filtering**: Filter tasks by status, priority, assignee, and more
- **Time Tracking**: Log time spent on tasks and view progress against estimates
- **Role-Based Permissions**: Different capabilities based on user role:
  - Managers can approve closed tasks and have admin privileges
  - Developers can create, edit, and close their assigned tasks
  - Testers can report and track bugs
- **Dashboard View**: Visual representation of project status with statistics
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 16.x or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bug-tracker.git
   cd bug-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

### Login Credentials

Use one of the following credentials to log in:

| Username | Password | Role |
|----------|----------|------|
| devuser | devpass | Developer |
| manageruser | managerpass | Manager |
| alice | alicepass | Developer |
| bob | bobpass | Developer |
| carol | carolpass | Tester |
| dave | davepass | Developer |
| eve | evepass | Manager |

## Project Structure

```
bug-tracker/
├── src/
│   ├── app/                # App-based routing
│   │   ├── layout.js       # Root layout
│   │   ├── page.js         # Home page
│   │   ├── login/          # Login route
│   │   ├── dashboard/      # Dashboard route
│   │   └── ...             # Other routes
│   ├── components/         # All components
│   │   ├── common/         # Common components (Header, Footer, etc.)
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── auth/           # Authentication components
│   │   ├── ui/             # UI components (Button, Card, etc.)
│   │   └── modals/         # Modal components
│   ├── styles/             # All styles
│   │   ├── globals.css     # Global styles
│   │   ├── variables.css   # CSS variables
│   │   ├── components/     # Component-specific styles
│   │   └── pages/          # Page-specific styles
│   ├── utils/              # Utility functions
│   └── context/            # Context providers (you already have this)
│   └── hooks/              # Custom hooks
└── services/           # API services
```

## Technology Stack

- **Frontend**: React.js, Next.js 15.x
- **State Management**: React Context API
- **Styling**: CSS Modules
- **Charts**: Chart.js for data visualization
- **Authentication**: Simple mock authentication (for demo purposes)

## Design Decisions and Assumptions

1. **Authentication**: For simplicity, the application uses a mock authentication system with predefined users. In a production environment, this would be replaced with a proper authentication service.

2. **Data Persistence**: Currently, data is stored in memory and resets when the application is restarted. In a real-world scenario, this would connect to a database.

3. **Time Tracking**: The time logging feature uses a simple format (days, hours, minutes) and calculates progress based on estimated vs. logged time.

4. **Workflow**: The application implements a basic workflow where tasks can be created, worked on, closed, and require manager approval - mimicking real-world development processes.

## Highlighted Features

### Role-Based Access Control
The application implements a comprehensive role-based permission system, ensuring users can only perform actions appropriate to their role. This is demonstrated in the SidePanel component, where different actions are available based on user permissions.

### Time Tracking System
The time tracking system allows users to log time against tasks and visualize progress. It supports flexible time input formats (e.g., "1d 4h 30m") and automatically calculates completion percentages.

### Task Approval Workflow
Tasks follow a workflow that mimics real development processes, where completed tasks must be approved by managers before being fully closed, improving accountability and quality control.

## Future Improvements

- Add server-side authentication with JWT
- Implement database integration for persistent data storage
- Add project and team management features
- Implement notification system for task updates
- Add test coverage and CI/CD pipeline
- Enable file attachments for tasks

## License

This project is licensed under the MIT License - see the LICENSE file for details.
