const sql = require("../db.js");
const { fail } = require("./helpers.js");

// POST /api/clubs/:title/books-read — add a finished book.
// Used when ending a vote (the old current book moves into the read history).
// Body: title, author, cover, description, username (must be the club manager).
const add = function (req, res) {
  const clubTitle = req.params.title;
  const { title, author, cover, description, username } = req.body;
  if (!title) return fail(req, res, 400, "A book title is required.");

  sql.query("SELECT id, manager_username FROM clubs WHERE title = ?", [clubTitle], (err, rows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    if (rows.length === 0) return fail(req, res, 404, "Club not found.");
    if (username && rows[0].manager_username !== username) {
      return fail(req, res, 403, "Only the club manager can update the read list.");
    }
    sql.query(
      "INSERT INTO books_read (club_id, title, author, cover, description) VALUES (?,?,?,?,?)",
      [rows[0].id, title, author || null, cover || null, description || null],
      (err2, result) => {
        if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
        res.status(201).json({ message: "Book added to read list", id: result.insertId });
      }
    );
  });
};

// PUT /api/books-read/:id/rating — set/replace the current user's star rating (1-5).
// Body: username, rating
const setRating = function (req, res) {
  const bookId = req.params.id;
  const { username, rating } = req.body;
  if (!username) return fail(req, res, 400, "Missing username.");
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    return fail(req, res, 400, "Rating must be an integer from 1 to 5.");
  }

  // The book must exist; only members of its club may rate it.
  sql.query("SELECT club_id FROM books_read WHERE id = ?", [bookId], (err, rows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    if (rows.length === 0) return fail(req, res, 404, "Book not found.");

    sql.query(
      "SELECT 1 FROM club_members WHERE club_id = ? AND username = ?",
      [rows[0].club_id, username],
      (err2, memRows) => {
        if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
        if (memRows.length === 0) return fail(req, res, 403, "Only club members can rate books.");

        sql.query(
          "INSERT INTO book_ratings (book_read_id, username, rating) VALUES (?,?,?) " +
          "ON DUPLICATE KEY UPDATE rating = VALUES(rating)",
          [bookId, username, r],
          (err3) => {
            if (err3) { console.log("error:", err3); return fail(req, res, 400, "DB error."); }
            res.json({ message: "Rating saved" });
          }
        );
      }
    );
  });
};

module.exports = { add, setRating };
