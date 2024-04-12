require("dotenv").config();
const express = require("express");

const cloudinary = require("cloudinary").v2;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");

const errorHandlerMiddleware = require("./middleware/error-handler");
const notFound = require("./middleware/not-found");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const imageRoutes = require("./routes/upload.routes");

const connectDB = require("./config/db");

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.set("trust proxy", 1);

app.use(cors());

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(passport.initialize());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
require("./config/twitterAuth")(passport);
require("./config/googleAuth")(passport);

app.get("/google", (req, res) => {
  res.send('<a href="/api/v1/google">Authenticate with google</a>');
  res.send("euphoria.com");
});
app.get("/x", (req, res) => {
  res.send('<a href="/api/v1/twitter">Authenticate with twitter</a>');
  res.send("euphoria.com");
});

app.use("/api/v1", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/uploads", imageRoutes);

app.use(notFound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
