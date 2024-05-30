const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// // Index route(shows all listings)
// router.get("/", wrapAsync(listingController.index));

// //New Route (renders the form to create a new listing)
// router.get("/new", isLoggedIn, listingController.renderNewForm);

// //Create Route (cretaes a new listing)
// router.post(
//   "/",
//   isLoggedIn,
//   validateListing,
//   wrapAsync(listingController.createNewListing)
// );

// combine the index route and create route as the path is same
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createNewListing)
  );
// .post(upload.single("listing[image]"), (req, res) => {
//   res.send(req.file);
// });

//New Route (renders the form to create a new listing)
router.get("/new", isLoggedIn, listingController.renderNewForm);

// //Show Route (shows a particular listing)
// router.get("/:id", wrapAsync(listingController.showListing));

// Edit Route (edits a particular listing)
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// //Update Route (updates a particular listing)
// router.put(
//   "/:id",
//   isLoggedIn,
//   isOwner,
//   validateListing,
//   wrapAsync(listingController.updateListing)
// );

// // Delete Route (deletes a particular listing)
// router.delete(
//   "/:id",
//   isLoggedIn,
//   isOwner,
//   wrapAsync(listingController.destroyListing)
// );

// combine the show route, update route and delete route as the path is same
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;
