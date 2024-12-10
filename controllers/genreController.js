const Genre = require("../models/genre");
const Book = require("../models/book");
const asynchandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// List all genres
exports.genre_list = asynchandler(async (req, res, next) => {
  const allgenre = await Genre.find({}, "_id name").sort({ name: 1 }).exec();

  res.render("genreList", (genre_list = allgenre));
});

// Genre details by ID
exports.genre_detail = asynchandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);
  if (genre === null) {
    // No results.
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }
  res.render("genreDetail", {
    title: "Genre Detail",
    genre: genre,
    genre_books: booksInGenre,
  });
});

// Display form to create a genre (GET)
exports.genre_create_get = asynchandler(async (req, res, next) => {
  res.render("genreForm", {
    title: "Create Genre",
    genre: {}, // An empty genre object
    errors: [], // Default empty errors array
  });
});

// Handle genre creation (POST)
exports.genre_create_post = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 }) // Ensure min length check is correct
    .escape(),

  asynchandler(async (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      res.render("genreForm", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Check if the genre already exists
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 }) // Case insensitive comparison
        .exec();

      if (genreExists) {
        // Redirect to the existing genre's detail page
        res.redirect(`/catalog/genre/${genreExists._id}`);
      } else {
        // If genre does not exist, save it
        await genre.save();
        res.redirect("/catalog/genre"); // Redirect to the genre list
      }
    }
  }),
];

// Display form to delete a genre (GET)
exports.genre_delete_get = asynchandler(async (req, res, next) => {
  res.send("Not Implemented: Genre Delete (GET)");
});

// Handle genre deletion (POST)
exports.genre_delete_post = asynchandler(async (req, res, next) => {
  res.send("Not Implemented: Genre Delete (POST)");
});

// Display form to update a genre (GET)
exports.genre_update_get = asynchandler(async (req, res, next) => {
  res.send("Not Implemented: Genre Update (GET)");
});

// Handle genre update (POST)
exports.genre_update_post = asynchandler(async (req, res, next) => {
  res.send("Not Implemented: Genre Update (POST)");
});
