/**
 * Passport Configuration
 * Implements Google OAuth 2.0 strategy.
 */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../database/models/User');
const env = require('../../config/env');

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // If not, check if user exists with this email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link googleId to existing account
          user.googleId = profile.id;
          if (!user.avatar) user.avatar = profile.photos[0]?.value;
          await user.save();
          return done(null, user);
        }

        // Create new user if not found
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0]?.value,
          isVerified: true, // Google emails are pre-verified
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// No sessions needed for JWT-based auth, but passport requires these if not disabled
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  // const user = await User.findById(id);
  done(null, null);
});

module.exports = passport;
