require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
const logger = require('./middleware/logger');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: 'draft-8', legacyHeaders: false }));

if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET is missing. Add it to your .env file.');
app.use(session({
  name: 'sms.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI, collectionName: 'sessions' }),
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 8 }
}));
app.use((req, res, next) => { res.locals.userName = req.session.userName || 'User'; next(); });

app.get('/', (req, res) => res.redirect(req.session.userId ? '/dashboard' : '/login'));
app.use(authRoutes);
app.use(studentRoutes);
app.use((req, res) => res.status(404).render('404', { title: 'Page not found' }));
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).render('500', { title: 'Something went wrong' });
});

connectDB().then(() => app.listen(PORT, () => console.log(`Student Management System running at http://localhost:${PORT}`)))
  .catch((error) => { console.error('Application startup failed:', error.message); process.exit(1); });
