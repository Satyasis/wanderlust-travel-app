if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

// console.log(process.env); // remove this after you've confirmed it is working

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbURL = process.env.ATLASDB_URL;

async function main() {
  // await mongoose.connect(MONGO_URL);
  await mongoose.connect(dbURL);
}

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs"); // to set view engine
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store: store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 100, //Expires after 7 days.(in milliseconds)
    maxAge: 7 * 24 * 60 * 60 * 100,
    httpOnly: true, //to prevent cross scripting attacks
  },
};

app.use(session(sessionOptions));
app.use(flash()); // It comes before routes

//from passport documentation
app.use(passport.initialize());
app.use(passport.session());

//from passport-local-mongoose documentation
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware for flash
// res.local is used to set variables accessible in templates rendered with res.render
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  // console.log(res.locals.successMsg); // It is an array.
  res.locals.errorMsg = req.flash("error");
  // console.log(res.locals.errorMsg);
  res.locals.currUser = req.user; //It stores info about current user
  next();
});

//Adding demo user data
// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// });

// Listings Routes -> using express router
app.use("/listings", listingRouter); // After "/listings" anything in the URL route will be searcched in the listing.js file
// Reviews Routes -> using express router
app.use("/listings/:id/reviews", reviewRouter); // After "/listings/:id/reviews" anything in the URL route will be searched in the reviews.js file
// User Routes -> using express router
app.use("/", userRouter);

// // Home Route
// app.get("/", (req, res) => {
//   res.send("Hi, I am Groot.");
// });

// URL error (if the route searched in the URL does not exist then it will give this error)
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error handling -> Middlewares
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("listings/error.ejs", { err });
});

// Server
app.listen(8080, (req, res) => {
  console.log("server is listening to port 8080");
});
