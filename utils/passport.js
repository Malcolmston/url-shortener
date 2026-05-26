/**
 * Passport.js configuration — local strategy (username + password)
 *
 * Usage in app.js:
 *   const configurePassport = require('./utils/passport');
 *   configurePassport(passport, User);
 */
const LocalStrategy = require('passport-local').Strategy;

/**
 * @param {import('passport')} passport
 * @param {typeof import('../database/User').default} User  — Sequelize model
 */
function configurePassport(passport, User) {
  // ── Serialise: store user.id in session ──────────────────────────────────
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // ── Deserialise: load full user from DB on every request ─────────────────
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({
        where: { id },
        attributes: { exclude: ['password'] },
      });
      done(null, user || false);
    } catch (err) {
      done(err);
    }
  });

  // ── Local strategy: authenticate with username + password ─────────────────
  passport.use(
    'local',
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: false,
      },
      async (username, password, done) => {
        try {
          // 1. Find user (include soft-deleted for a better error message)
          const user = await User.findOne({
            where: { username },
            paranoid: false, // include soft-deleted
          });

          // 2. User not found at all
          if (!user) {
            return done(null, false, { message: 'Incorrect username or password' });
          }

          // 3. Soft-deleted account
          if (user.isSoftDeleted && user.isSoftDeleted()) {
            return done(null, false, { message: 'This account has been deleted' });
          }

          // 4. Password check (uses the model's isValidPassword helper)
          const valid =
            typeof user.isValidPassword === 'function'
              ? user.isValidPassword(password)
              : false;

          if (!valid) {
            return done(null, false, { message: 'Incorrect username or password' });
          }

          // 5. Success — return user without password field
          user.password = undefined;
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}

module.exports = configurePassport;
