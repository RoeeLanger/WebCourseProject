const sql = require("../db.js");
const { fail } = require("./helpers.js");

// Normalize a datetime-local value ("YYYY-MM-DDTHH:MM") to a MySQL DATETIME literal.
function toDbDatetime(v) {
  return (v || "").replace("T", " ");
}

// POST /api/clubs/:title/meetings — manager schedules a meeting.
// Body: title, location, datetime, username (must be the club manager).
const add = function (req, res) {
  const clubTitle = req.params.title;
  const { title, location, datetime, username } = req.body;
  if (!datetime) return fail(req, res, 400, "A date and time is required.");
  if (!username) return fail(req, res, 400, "Missing username.");

  sql.query("SELECT id, manager_username FROM clubs WHERE title = ?", [clubTitle], (err, rows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    if (rows.length === 0) return fail(req, res, 404, "Club not found.");
    if (rows[0].manager_username !== username) {
      return fail(req, res, 403, "Only the club manager can schedule meetings.");
    }
    sql.query(
      "INSERT INTO meetings (club_id, title, location, meeting_datetime) VALUES (?,?,?,?)",
      [rows[0].id, title || "Meeting", location || null, toDbDatetime(datetime)],
      (err2, result) => {
        if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
        res.status(201).json({ message: "Meeting scheduled", id: result.insertId });
      }
    );
  });
};

// PUT /api/meetings/:id — manager edits a meeting.
// Body: title, location, datetime, username (must be the manager of the meeting's club).
const update = function (req, res) {
  const id = req.params.id;
  const { title, location, datetime, username } = req.body;
  if (!datetime) return fail(req, res, 400, "A date and time is required.");

  sql.query(
    "SELECT c.manager_username FROM meetings m JOIN clubs c ON c.id = m.club_id WHERE m.id = ?",
    [id],
    (err, rows) => {
      if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
      if (rows.length === 0) return fail(req, res, 404, "Meeting not found.");
      if (rows[0].manager_username !== username) {
        return fail(req, res, 403, "Only the club manager can edit meetings.");
      }
      sql.query(
        "UPDATE meetings SET title = ?, location = ?, meeting_datetime = ? WHERE id = ?",
        [title || "Meeting", location || null, toDbDatetime(datetime), id],
        (err2) => {
          if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
          res.json({ message: "Meeting updated" });
        }
      );
    }
  );
};

// DELETE /api/meetings/:id — manager deletes a meeting.
// Body: username (must be the manager of the meeting's club).
const remove = function (req, res) {
  const id = req.params.id;
  const { username } = req.body;

  sql.query(
    "SELECT c.manager_username FROM meetings m JOIN clubs c ON c.id = m.club_id WHERE m.id = ?",
    [id],
    (err, rows) => {
      if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
      if (rows.length === 0) return fail(req, res, 404, "Meeting not found.");
      if (rows[0].manager_username !== username) {
        return fail(req, res, 403, "Only the club manager can delete meetings.");
      }
      sql.query("DELETE FROM meetings WHERE id = ?", [id], (err2) => {
        if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
        res.json({ message: "Meeting deleted" });
      });
    }
  );
};

module.exports = { add, update, remove };
