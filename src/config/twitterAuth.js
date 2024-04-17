require("dotenv").config();
const { Strategy } = require("@superfaceai/passport-twitter-oauth2");
const User = require("../models/User");
const logger = require("../utils/logger");
const createTokenUser = require("../utils/createTokenUser");
module.exports = (passport) => {
  passport.use(
    new Strategy(
      {
        clientType: "confidential",
        clientID: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/v1/twitter/callback",
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ twitterId: profile.id });

          // If user doesn't exist, create new user
          if (!user) {
            user = new User({
              twitterId: profile.id,
              name: profile.displayName,
              photo: profile.photos[0].value,
            });
            await user.save();
          }
          logger.info("Logged in from twitter");

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser(function (user, done) {
    const tokenUser = createTokenUser(user);

    done(null, tokenUser);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
