const Author = require("../models/author");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");

const asynchandler = require("express-async-handler");

exports.author_list = asynchandler(async (req, res, next) => {
  const allAuthor = await Author.find(
    {},
    "first_name family_name date_of_birth date_of_death"
  )
    .sort({ first_name: 1 })
    .exec();

  res.render("authorList", { title: "Author List", author_list: allAuthor });
});

exports.author_detail = asynchandler(async (req, res, next) => {
  const [author, bookInAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  res.render("authorDetail", {
    title: "Author Detail",
    author: author,
    authors_books: bookInAuthor,
    errorMessage :null
  });
});

exports.author_create_get = asynchandler(async (req, res, next) => {
  res.render("authorForm", {
    author: {},
    errors: [],
  });
});

exports.author_create_post = [
  body("first_name")
    .trim()
    .isLength(1)
    .escape()
    .withMessage("First Name Must Be Specifiec"),

  body("family_name")
    .trim()
    .isLength(1)
    .escape()
    .withMessage("First Name Must Be Specifiec"),

  body("date_of_birth", "Invalid Date Of Birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asynchandler(async (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    if (!errors.isEmpty()) {
      res.render("authorForm", {
        title: "Create Author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      await author.save();
      res.redirect(`/catalog/author`);
    }
  }),
];
exports.author_delete_get = asynchandler(async (req, res, next) => {
  const [author, allBookByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (author === null) {
    res.redirect("/catalog/author");
  }
  res.render("authorDetail", {
    title: "Delete Author",
    author: author,
    author_book: allBookByAuthor,
    errorMessage :{}
  });
});


exports.author_delete_post = asynchandler(async (req, res, next) => {
  const [author, allAuthorBook] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }).exec()

  ])
  if (allAuthorBook.length > 0) {
    // Author has books. Render in same way as for GET route.
    res.render("authorDetail", {
      title: "Delete Author",
      author: author,
      author_book: allAuthorBook,
      errorMessage: "Author has associated books. You must delete the books first before deleting the author."
    });
    return;
  } else {
    // Author has no books. Delete object and redirect to the list of authors.
    await Author.findByIdAndDelete(req.params.id);
    res.redirect("/catalog/author");
  }
});


exports.author_update_get = asynchandler(async (req, res, next) => {
  res.send("Not implemented: Author update get");
});
exports.author_update_post = asynchandler(async (req, res, next) => {
  res.send("Not implemeted: Auhtor update post");
});
