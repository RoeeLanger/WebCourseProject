const sql = require("../db.js");
const { fail } = require("./helpers.js");

// GET /api/users/:username — profile: user + their clubs (titles) + derived managedClub.
const getUser = function (req, res) {
  const username = req.params.username;

  sql.query(
    "SELECT username, nickname, email, join_date FROM users WHERE username = ?",
    [username],
    (err, rows) => {
      if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
      if (rows.length === 0) return fail(req, res, 404, "User not found.");
      const user = rows[0];

      sql.query(
        "SELECT c.title, c.manager_username FROM club_members cm " +
        "JOIN clubs c ON c.id = cm.club_id WHERE cm.username = ? ORDER BY c.title",
        [username],
        (err2, clubRows) => {
          if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
          const managed = clubRows.find((r) => r.manager_username === username);
          res.json({
            username: user.username,
            nickname: user.nickname,
            email: user.email,
            joinDate: user.join_date,
            clubs: clubRows.map((r) => r.title),
            managedClub: managed ? managed.title : null
          });
        }
      );
    }
  );
};

// GET /api/users/:username/meetings — meetings across all the user's clubs (profile + calendar).
const getUserMeetings = function (req, res) {
  const username = req.params.username;

  sql.query(
    "SELECT m.id, m.title, m.location, m.meeting_datetime AS datetime, c.title AS clubName " +
    "FROM meetings m " +
    "JOIN clubs c ON c.id = m.club_id " +
    "JOIN club_members cm ON cm.club_id = m.club_id " +
    "WHERE cm.username = ? ORDER BY m.meeting_datetime",
    [username],
    (err, rows) => {
      if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
      res.json(rows);
    }
  );
};

module.exports = { getUser, getUserMeetings };
