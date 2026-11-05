# 🎓 CampusFlow – Student Management System

A full-stack Student Management System built using **Node.js, Express.js, EJS and MongoDB Atlas**. CampusFlow helps administrators manage student records, monitor student information and track daily attendance through a clean dashboard.

## ✨ Features

- **Admin Authentication:** Secure admin registration, login and logout.
- **Dashboard:** Overview of total, active and inactive students.
- **Student Management:** Add, view, edit and delete student records.
- **Search:** Find students using the search functionality.
- **Pagination:** Navigate student records across multiple pages.
- **Attendance Management:** Mark students as Present or Absent.
- **Attendance History:** View attendance records from previous dates.
- **Database Integration:** Store student and attendance records in MongoDB Atlas.
- **Responsive Styling:** Clean dashboard interface with organized layouts.

## 🛠️ Technologies Used

| Technology      | Purpose                   |
| --------------- | ------------------------- |
| HTML5           | Structure                 |
| CSS3            | Styling and layout        |
| JavaScript      | Client-side functionality |
| Node.js         | Backend runtime           |
| Express.js      | Web application framework |
| EJS             | Dynamic page rendering    |
| MongoDB Atlas   | Cloud database            |
| Mongoose        | MongoDB object modeling   |
| bcryptjs        | Password hashing          |
| Express Session | Session management        |

## 📸 Screenshots

### Dashboard



### Add Student



### Student Directory and Pagination



### Student Details



### Attendance Management



### Previous Attendance History



### Admin Login



## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Student-Management-System
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root directory.

```env
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=your_secure_random_secret
```

Replace the placeholder values with your own configuration.

### 4. Configure MongoDB Atlas

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a cluster and database user.
3. Configure your network access.
4. Copy your MongoDB connection string.
5. Add it to the `MONGODB_URI` variable in `.env`.

### 5. Start the application

```bash
npm start
```

Open your browser and visit:

```text
http://localhost:3000
```

Register an administrator account to access the dashboard.

## 📁 Project Structure

```text
Student-Management-System/
│
├── config/
├── controllers/
├── middleware/
├── models/
├── public/
│   ├── css/
│   └── js/
├── routes/
├── views/
├── screenshots/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## 🔐 Security Notes

- Environment variables are stored in `.env`.
- `.env` is excluded from version control.
- Passwords are hashed using bcryptjs.
- Authenticated routes are protected using middleware.
- Session management is configured for admin authentication.

## 🚀 Future Enhancements

- Export student records to CSV or Excel.
- Attendance percentage reports.
- Department-wise student analytics.
- Improved mobile interface.

## 👩‍💻 Author

**Gorentla Sreeja**

GitHub: [GorentlaSreeja](https://github.com/GorentlaSreeja)

Portfolio: [My Portfolio](https://sreeja-portfolio-alpha.vercel.app/)

---

⭐ If you find this project useful, consider giving it a star!

