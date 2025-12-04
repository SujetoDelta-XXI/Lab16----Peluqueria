import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { config } from './env';
import { Usuario, Cliente, Peluquero } from '../models';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        // Check if user already exists
        const existingUser = await Usuario.findOne({ email: profile.emails?.[0].value });

        if (existingUser) {
          // User exists, update last access
          existingUser.ultimoAcceso = new Date();
          await existingUser.save();
          return done(null, existingUser);
        }

        // User doesn't exist, we'll need to create them
        // But we need to know if they want to be a client or hairstylist
        // This will be handled in the callback route
        return done(null, profile);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;
