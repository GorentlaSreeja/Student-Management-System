const router = require('express').Router();
const auth = require('../controllers/authController');
const { redirectIfAuth } = require('../middleware/auth');
router.get('/register', redirectIfAuth, auth.showRegister);
router.post('/register', redirectIfAuth, auth.register);
router.get('/login', redirectIfAuth, auth.showLogin);
router.post('/login', redirectIfAuth, auth.login);
router.post('/logout', auth.logout);
module.exports = router;
