const bcrypt = require('bcryptjs');
const User = require('../models/User');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.showRegister = (req, res) => {
  res.render('register', { title: 'Create account', error: null });
};

exports.showLogin = (req, res) => {
  res.render('login', { title: 'Welcome back', error: null });
};

exports.register = async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name || name.length > 80 || !emailPattern.test(email) || password.length < 8) {
      return res.status(400).render('register', {
        title: 'Create account',
        error: 'Enter a valid name, email and password with at least 8 characters.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).render('register', {
        title: 'Create account',
        error: 'An account with this email already exists.'
      });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12)
    });

    // Regenerate the session after account creation to prevent session fixation.
    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.userId = user.id;
      req.session.userName = user.name;

      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        return res.redirect('/dashboard');
      });
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).render('register', {
        title: 'Create account',
        error: 'An account with this email already exists.'
      });
    }
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).render('login', {
        title: 'Welcome back',
        error: 'Email or password is incorrect.'
      });
    }

    // Rotate the session ID after successful authentication.
    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.userId = user.id;
      req.session.userName = user.name;

      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        return res.redirect('/dashboard');
      });
    });
  } catch (error) {
    return next(error);
  }
};

exports.logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    // Must match the custom cookie name configured in server.js.
    res.clearCookie('sms.sid', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    return res.redirect('/login');
  });
};
