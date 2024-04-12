require("dotenv").config();
const { Strategy } = require("@superfaceai/passport-twitter-oauth2");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
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
      asyncHandler(async function (accessToken, refreshToken, profile, done) {
        let user = await User.findOne({ twitterId: profile.id });
        if (!user) {
          user = new User({
            twitterId: profile.id,
            photo: profile.photos[0].value,
            name: profile.username,
          });
          await user.save();
          logger.info("Logged in from twitter");
        }
        return done(null, user);
      })
    )
  );

  passport.serializeUser(function (user, done) {
    const tokenUser = createTokenUser(user);

    done(null, tokenUser);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
