const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db'); // Your MySQL connection

passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // Only allow users with Gmail accounts
    const email = profile.emails[0].value;
    if (!email.endsWith('@gmail.com')) {
      return done(null, false, { message: 'Only Gmail accounts allowed' });
    }

    // Check if user exists, else create user in DB
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) return done(err);

      if (results.length > 0) {
        // User exists
        return done(null, results[0]);
      } else {
        // Create new user
        const newUser = {
          full_name: profile.displayName,
          email: email
        };
        db.query('INSERT INTO users (full_name, email) VALUES (?, ?)', [newUser.full_name, newUser.email], (err2, result) => {
          if (err2) return done(err2);
          newUser.user_id = result.insertId;
          return done(null, newUser);
        });
      }
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM users WHERE user_id = ?', [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]);
  });
});
