const sql = require("../db.js");
const { fail } = require("./helpers.js");

// POST /api/clubs/:title/announcements — manager posts an announcement.
// Body: text, username (author = current user, must be the club manager).
const add = function (req, res) {
  const title = req.params.title;
  const { text, username } = req.body;
  if (!text || !text.trim()) return fail(req, res, 400, "Announcement text is required.");
  if (!username) return fail(req, res, 400, "Missing username.");

  sql.query("SELECT id, manager_username FROM clubs WHERE title = ?", [title], (err, rows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    if (rows.length === 0) return fail(req, res, 404, "Club not found.");
    if (rows[0].manager_username !== username) {
      return fail(req, res, 403, "Only the club manager can post announcements.");
    }
    sql.query(
      "INSERT INTO announcements (club_id, author_username, text) VALUES (?,?,?)",
      [rows[0].id, username, text.trim()],
      (err2, result) => {
        if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
        res.status(201).json({ message: "Announcement posted", id: result.insertId });
      }
    );
  });
};

// DELETE /api/announcements/:id — manager deletes an announcement.
// Body: username (must be the manager of the announcement's club).
const remove = function (req, res) {
  const id = req.params.id;
  const { username } = req.body;

  sql.query(
    "SELECT c.manager_username FROM announcements a JOIN clubs c ON c.id = a.club_id WHERE a.id = ?",
    [id],
    (err, rows) => {
      if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
      if (rows.length === 0) return fail(req, res, 404, "Announcement not found.");
      if (rows[0].manager_username !== username) {
        return fail(req, res, 403, "Only the club manager can delete announcements.");
      }
      sql.query("DELETE FROM announcements WHERE id = ?", [id], (err2) => {
        if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
        res.json({ message: "Announcement deleted" });
      });
    }
  );
};

module.exports = { add, remove };
