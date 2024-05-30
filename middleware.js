const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

// Server side validation for listing -> middleware
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Server side validation for reviews
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// It verifies first you logged in or not -> middleware
module.exports.isLoggedIn = (req, res, next) => {
  // console.log(req);
  // console.log(req.user);

  if (!req.isAuthenticated()) {
    // console.log(req.path);
    // console.log(req.originalUrl);
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in first!");
    return res.redirect("/login");
  }
  next();
};

//post login page
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

//Verifies owner of the particular listing
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have the required authorization!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

//Verifies author of the particular review
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You don't have the required authorization!");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
