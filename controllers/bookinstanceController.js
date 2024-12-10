const BookInstance = require("../models/bookInstance");
const asynchandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Book = require("../models/book");
const bookInstance = require("../models/bookInstance");

// Display list of all book instances
exports.bookinstance_list = asynchandler(async (req, res, next) => {
  const allbookInstance = await BookInstance.find({}, "book imprint status")
    .populate("book")
    .exec();

  res.render("bookInstanceList", { bookInstance_list: allbookInstance });
});

// Display details for a specific book instance by ID
exports.bookinstance_detail = asynchandler(async (req, res, next) => {
  res.send(
    `Not Implemented: Displaying details for Book Instance ID ${req.params.id}.`
  );
});

// Display form to create a new book instance (GET)
exports.bookinstance_create_get = asynchandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
  res.render("bookInstanceForm", {
    book_list: allBooks,
    bookinstance: bookInstance,
  });
});

// Handle creation of a new book instance (POST)
exports.bookinstance_create_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status", "Status must be provided").escape(),

  asynchandler(async (req, res, next) => {
    const errors = validationResult(req);

    const newBookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
    });

    if (!errors.isEmpty()) {
      const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

      res.render("bookInstanceForm", {
        title: "Create Book Instance",
        book: allBooks,
        bookinstance: newBookInstance,
        errors: errors.array(),
      });
      return;
    } else {
      await newBookInstance.save();
      res.redirect("/catalog/bookinstance");
    }
  }),
];

// Display form to delete a book instance (GET)
exports.bookinstance_delete_get = asynchandler(async (req, res, next) => {
  res.send("Not Implemented: Displaying form to delete a book instance (GET).");
});

// Handle deletion of a book instance (POST)
exports.bookinstance_delete_post = asynchandler(async (req, res, next) => {
  res.send("Not Implemented: Handling deletion of a book instance (POST).");
});

// Display form to update a book instance (GET)
exports.bookinstance_update_get = asynchandler(async (req, res, next) => {
  res.send("Not Implemented: Displaying form to update a book instance (GET).");
});

// Handle updating of a book instance (POST)
exports.bookinstance_update_post = asynchandler(async (req, res, next) => {
  res.send("Not Implemented: Handling update of a book instance (POST).");
});
