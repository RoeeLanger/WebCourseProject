const sql = require("../db.js");
const { fail } = require("./helpers.js");

// POST /api/clubs/:title/polls — manager creates a poll with its books.
// Body: createdBy (manager), books: [{ title, author, cover, description, key }]
const create = function (req, res) {
  const clubTitle = req.params.title;
  const { createdBy, books } = req.body;
  if (!createdBy) return fail(req, res, 400, "Missing creator.");
  if (!Array.isArray(books) || books.length === 0) {
    return fail(req, res, 400, "A poll needs at least one book.");
  }

  sql.query("SELECT id, manager_username FROM clubs WHERE title = ?", [clubTitle], (err, rows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    if (rows.length === 0) return fail(req, res, 404, "Club not found.");
    if (rows[0].manager_username !== createdBy) {
      return fail(req, res, 403, "Only the club manager can create polls.");
    }

    sql.query(
      "INSERT INTO polls (club_id, created_by) VALUES (?, ?)",
      [rows[0].id, createdBy],
      (err2, result) => {
        if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
        const pollId = result.insertId;
        const values = books.map((b) => [pollId, b.title, b.author || null, b.cover || null, b.description || null, b.key || null]);
        sql.query(
          "INSERT INTO poll_books (poll_id, title, author, cover, description, ol_key) VALUES ?",
          [values],
          (err3) => {
            if (err3) { console.log("error:", err3); return fail(req, res, 400, "DB error."); }
            res.status(201).json({ message: "Poll created", pollId });
          }
        );
      }
    );
  });
};

// POST /api/polls/:pollId/vote — cast a vote (the UI allows up to 2 books).
// One submission per poll: prior votes by this user in this poll are replaced.
// Body: username, pollBookIds: [ ... ]
const vote = function (req, res) {
  const pollId = req.params.pollId;
  const { username, pollBookIds } = req.body;
  if (!username) return fail(req, res, 400, "Missing username.");
  const ids = Array.isArray(pollBookIds) ? pollBookIds : [];
  if (ids.length === 0) return fail(req, res, 400, "Select at least one book.");

  // Poll must exist; capture its club to verify membership.
  sql.query("SELECT club_id FROM polls WHERE id = ?", [pollId], (err, pollRows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    if (pollRows.length === 0) return fail(req, res, 404, "Poll not found.");
    const clubId = pollRows[0].club_id;

    sql.query(
      "SELECT 1 FROM club_members WHERE club_id = ? AND username = ?",
      [clubId, username],
      (err2, memRows) => {
        if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
        if (memRows.length === 0) return fail(req, res, 403, "Only club members can vote.");

        // Validate the submitted books belong to this poll.
        sql.query("SELECT id FROM poll_books WHERE poll_id = ?", [pollId], (err3, bookRows) => {
          if (err3) { console.log("error:", err3); return fail(req, res, 400, "DB error."); }
          const valid = new Set(bookRows.map((r) => r.id));
          const chosen = ids.filter((id) => valid.has(Number(id))).slice(0, 2);
          if (chosen.length === 0) return fail(req, res, 400, "Invalid selection.");

          // One submission per poll: clear this user's prior votes in this poll first.
          sql.query(
            "DELETE pv FROM poll_votes pv JOIN poll_books pb ON pb.id = pv.poll_book_id WHERE pb.poll_id = ? AND pv.username = ?",
            [pollId, username],
            (err4) => {
              if (err4) { console.log("error:", err4); return fail(req, res, 400, "DB error."); }
              const values = chosen.map((id) => [id, username]);
              sql.query(
                "INSERT INTO poll_votes (poll_book_id, username) VALUES ?",
                [values],
                (err5) => {
                  if (err5) { console.log("error:", err5); return fail(req, res, 400, "DB error."); }
                  res.json({ message: "Vote recorded" });
                }
              );
            }
          );
        });
      }
    );
  });
};

// DELETE /api/polls/:pollId — manager ends/deletes the poll (CASCADE clears books + votes).
// Body: username (must be the manager of the poll's club).
const end = function (req, res) {
  const pollId = req.params.pollId;
  const { username } = req.body;

  sql.query(
    "SELECT c.manager_username FROM polls p JOIN clubs c ON c.id = p.club_id WHERE p.id = ?",
    [pollId],
    (err, rows) => {
      if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
      if (rows.length === 0) return fail(req, res, 404, "Poll not found.");
      if (rows[0].manager_username !== username) {
        return fail(req, res, 403, "Only the club manager can end polls.");
      }
      sql.query("DELETE FROM polls WHERE id = ?", [pollId], (err2) => {
        if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
        res.json({ message: "Poll ended" });
      });
    }
  );
};

module.exports = { create, vote, end };
