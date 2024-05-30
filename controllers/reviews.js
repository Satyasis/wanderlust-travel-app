const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

// Adds reviews to a particular listing and reviews ids to the listing data
module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  newReview.author = req.user._id;
  // console.log(newReview);

  await newReview.save();
  listing.reviews.push(newReview);

  await listing.save();
  req.flash("success", "New Review Created!");
  // console.log(listing);

  res.redirect(`/listings/${listing.id}`);
};

// deletes a particular review and also delete that review id from listing data
module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //pull is used to remove items
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted");

  res.redirect(`/listings/${id}`);
};
