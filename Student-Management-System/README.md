# CampusFlow — Student Management System

A full-stack student management application built with **Node.js, Express, EJS and MongoDB Atlas**. CampusFlow provides secure administrator accounts and a simple dashboard for creating, viewing, searching, editing and deleting student records.

## Features

- Student profile view with complete academic and contact details.
- Paginated student directory (10 records per page) with search.
- Daily attendance marking (Present/Absent) with one record per student per date.


- Administrator registration and login with bcrypt password hashing
- Session-based authentication with sessions stored in MongoDB
- Student CRUD: create, read, update and delete
- Search students by name, student ID, email or department
- Dashboard statistics for total, active and inactive students
- Input validation, duplicate student ID handling and error pages
- Request logging and rate limiting
- Responsive interface for desktop and mobile

## Tech stack

- Frontend: EJS, HTML, CSS, JavaScript
- Backend: Node.js, Express 5
- Database: MongoDB Atlas with Mongoose
- Authentication: express-session, connect-mongo, bcryptjs

## Run locally

1. Install [Node.js](https://nodejs.org/) (LTS recommended).
2. Clone or download this repository.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root by copying `.env.example`.
5. In MongoDB Atlas, create a database user and allow your current IP address in Network Access. Copy your Atlas connection string into `MONGODB_URI` in `.env`, replacing the placeholders.
6. Set a long, random value for `SESSION_SECRET`.
7. Start the application:

   ```bash
   npm start
   ```

8. Open [http://localhost:3000](http://localhost:3000), create an administrator account and add student records.

## Environment variables

| Variable | Description |
|---|---|
| `PORT` | Local server port (defaults to `3000`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `SESSION_SECRET` | Secret used to sign session cookies |
| `NODE_ENV` | Use `production` when deployed behind HTTPS |

## Project structure

```text
config/          Database connection
controllers/     Authentication and student logic
middleware/      Authentication guard and request logger
models/          User and Student Mongoose models
routes/          Authentication and student routes
views/           EJS pages and shared partials
public/css/      Responsive application styles
public/js/       Client-side enhancements
server.js        Application entry point
```

## Security notes

- Never commit `.env`, database credentials or session secrets.
- `.env.example` contains placeholders only.
- Use a strong unique database password and restrict Atlas Network Access appropriately. Avoid `0.0.0.0/0` for a production database.
- For production deployment, configure HTTPS and review cookie, rate-limit and database access settings for your hosting environment.

## Current scope

The dashboard currently displays up to the latest 100 matching student records. Pagination, role-based access and automated tests are good next improvements.

## License

MIT

### Attendance history
- Mark or update daily attendance for active students.
- Review saved attendance for earlier dates using the date selector.
- The attendance page lists the latest 30 dates with saved records and present/absent totals.
- Historical dates are read-only from the attendance screen; today can be marked or updated.
