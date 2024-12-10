const Book = require("../models/book");
const Author = require("../models/author");
const BookInstance = require("../models/bookInstance");
const Genre = require("../models/genre");
const { body, validationResult } = require("express-validator");

const asynchandler = require("express-async-handler");
const book = require("../models/book");

// Home page
exports.index = asynchandler(async (req, res, next) => {
  const [
    numBooks,
    numBookInstance,
    numAvaliableBookInstance,
    numAuthor,
    numGenre,
  ] = await Promise.all([
    Book.countDocuments({}).exec(),
    BookInstance.countDocuments({}).exec(),
    BookInstance.countDocuments({ status: "Available" }).exec(),
    Author.countDocuments({}).exec(),
    Genre.countDocuments({}).exec(),
  ]);

  return res.render("home", {
    title: "Local Library Home",
    book_count: numBooks,
    book_instance_count: numBookInstance,
    book_instance_avaliable_count: numAvaliableBookInstance,
    author_count: numAuthor,
    genre_count: numGenre,
  });
});

// List all books
exports.book_list = asynchandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title author")
    .sort({ title: 1 })
    .populate("author")
    .populate("genre")
    .exec();

  res.render("bookList", { title: "Book List", book_list: allBooks });
});

// Display details of a specific book by ID
exports.book_detail = asynchandler(async (req, res, next) => {
  try {
    // Fetch the book details and populate the author and genre fields
    const book = await Book.findById(req.params.id)
      .populate("author") // Populate author details
      .populate("genre") // Populate genre details
      .exec();

    // Check if the book is found
    if (!book) {
      return res.status(404).send("Book not found");
    }

    // Render the page with the found data
    res.render("bookDetail", {
      title: "Book Detail",
      Specific_book: book,
      books_author: book.author,
      books_genre: book.genre,
    });
  } catch (error) {
    // Catch any other errors and pass to error handling middleware
    next(error);
  }
});

// Display form to create a new book (GET)
exports.book_create_get = asynchandler(async (req, res, next) => {
  const [allAuthors, allGenres] = await Promise.all([
    Author.find().sort({ family_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
  ]);
  res.render("bookForm", {
    authors: allAuthors,
    genres: allGenres,
    book: book,
  });
});

// Handle book create on POST.
exports.book_create_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  asynchandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      const [allAuthors, allGenres] = await Promise.all([
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
      ]);

      // Mark our selected genres as checked.
      for (const genre of allGenres) {
        if (book.genre.includes(genre._id)) {
          genre.checked = "true";
        }
      }

      // Render the form with errors and data.
      res.render("bookForm", {
        title: "Create Book",
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array(),
      });
    } else {
      await book.save();
      res.redirect(`/catalog/books`); // Redirect to the newly created book's URL.
    }
  }),
];

// Display form to delete a book (GET)
exports.book_delete_get = asynchandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id)
  .populate("author") // Populate author details
  .populate("genre") // Populate genre details
  .exec();

  res.render("bookDetail",{
    title : "Delete Book",
    book : book
  })

});

// Handle book deletion (POST)
exports.book_delete_post = asynchandler(async (req, res, next) => {
  const [book, allBookInstances] = await Promise.all([
    Book.findById(req.params.id)
      .populate("author")  // Populate author details
      .populate("genre")   // Populate genre details)
      .exec(),
    BookInstance.find({ book: req.params.id }).exec(),
  ]);

  // Check if the book exists
  if (!book) {
    return res.status(404).send("Book not found");
  }

  if (allBookInstances.length > 0) {
    // Delete all associated book instances
    await Promise.all(
      allBookInstances.map((instance) =>
        BookInstance.findByIdAndDelete(instance._id)
      )
    );
  }

  // Delete the book after deleting instances
  await Book.findByIdAndDelete(req.params.id);
  res.redirect('/catalog/books');
});

// Display form to update a book (GET)
exports.book_update_get = asynchandler(async (req, res, next) => {
  res.send("Not Implemented: Book Update (GET).");
});

// Handle book update (POST)
exports.book_update_post = asynchandler(async (req, res, next) => {
  res.send("Not Implemented: Book Update (POST).");
});
