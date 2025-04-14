# HR Management System

A comprehensive HR Management System built with React and Firebase.

## Deployment on Render

### Prerequisites

1. A Render account
2. Docker installed on your local machine (for testing)
3. Firebase project with configuration details

### Environment Variables

Before deploying, make sure to set up the following environment variables in your Render dashboard:

- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

### Deployment Steps

1. Fork or clone this repository
2. Create a new Web Service on Render
3. Connect your repository
4. Select "Docker" as the environment
5. Set the environment variables
6. Deploy!

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd hrmanagmentsystem
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Fill in your Firebase configuration in the `.env` file

5. Start the development server:
```bash
npm start
```

### Docker Local Testing

To test the Docker build locally:

```bash
docker build -t hr-management-system .
docker run -p 3000:3000 hr-management-system
```

Visit `http://localhost:3000` to see the application running.

## Features

- Employee Management
- Attendance Tracking
- Leave Management
- Payroll Management
- Training & Development
- Document Management
- Task Management
- Performance Reviews
- Role-based Access Control

## Tech Stack

- React
- Firebase (Authentication, Firestore, Storage)
- Tailwind CSS
- Framer Motion
- Chart.js
- React Router
- Date-fns
