require("dotenv").config();
const express = require("express");
const path = require("path");

const cloudinary = require("cloudinary").v2;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const errorHandlerMiddleware = require("./middleware/error-handler");
const logger = require("./utils/logger");
const notFound = require("./middleware/not-found");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");
const imageRoutes = require("./routes/upload.routes");
const productRoutes = require("./routes/product.routes");
const addressRoutes = require("./routes/address.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

const connectDB = require("./config/db");

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  message: "Too many requests", // message to send
});

app.set("trust proxy", 1);

app.use(cors());
app.use(limiter);

app.use(express.json());
app.use(helmet());
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
app.get("/doc", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.use("/api/v1", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/uploads", imageRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/carts", cartRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/orders", orderRoutes);

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
