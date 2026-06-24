const sql = require("../db.js");
const { wantsJSON, fail } = require("./helpers.js");

// Format a DATETIME (mysql2 returns a Date) as e.g. "May 18, 2026".
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// GET /api/clubs — all clubs (id, title, description) for the header search.
const getAllClubs = function (req, res) {
  sql.query("SELECT id, title, description FROM clubs ORDER BY title", [], (err, rows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    res.json(rows);
  });
};

// GET /api/clubs/:title — one club, fully hydrated for the club page.
const getClub = function (req, res) {
  const title = req.params.title;

  sql.query(
    "SELECT cl.id, cl.title, cl.manager_username, cl.description, cl.background, cl.max_members, cl.created_at, " +
    "u.nickname AS manager_nickname " +
    "FROM clubs cl JOIN users u ON u.username = cl.manager_username WHERE cl.title = ?",
    [title],
    (err, clubRows) => {
      if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
      if (clubRows.length === 0) return fail(req, res, 404, "Club not found.");

      const c = clubRows[0];
      const clubId = c.id;
      const data = {};
      let pending = 0;
      let failed = false;

      function step(key, query, params) {
        pending++;
        sql.query(query, params, (e, rows) => {
          if (failed) return;
          if (e) { failed = true; console.log("error:", e); return fail(req, res, 400, "DB error."); }
          data[key] = rows;
          pending--;
          if (pending === 0) assemble();
        });
      }

      function assemble() {
        // --- members enriched with each member's clubs + role (for the modal) ---
        const clubsByUser = {};
        data.memberClubs.forEach((r) => {
          (clubsByUser[r.username] = clubsByUser[r.username] || []).push({
            name: r.club_name,
            role: r.manager_username === r.username ? "Manager" : "Member"
          });
        });
        const members = data.members.map((m) => ({
          username: m.username,
          nickname: m.nickname,
          joinDate: m.join_date,
          clubs: clubsByUser[m.username] || []
        }));

        // --- announcements (newest first) ---
        const announcements = data.announcements.map((a) => ({
          id: a.id,
          text: a.text,
          from: a.from_nick,
          date: formatDate(a.created_at),
          authorUsername: a.author_username
        }));

        // --- meetings ---
        const meetings = data.meetings.map((m) => ({
          id: m.id,
          title: m.title,
          location: m.location,
          datetime: m.meeting_datetime,
          createdAt: m.created_at
        }));

        // --- books read + ratings ---
        const ratingsByBook = {};
        data.bookRatings.forEach((r) => {
          (ratingsByBook[r.book_read_id] = ratingsByBook[r.book_read_id] || {})[r.username] = r.rating;
        });
        const booksRead = data.booksRead.map((b) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          cover: b.cover,
          description: b.description,
          ratings: ratingsByBook[b.id] || {}
        }));

        // --- polls + books + votes ---
        const votesByBook = {};
        data.pollVotes.forEach((v) => {
          (votesByBook[v.poll_book_id] = votesByBook[v.poll_book_id] || []).push(v.username);
        });
        const booksByPoll = {};
        data.pollBooks.forEach((b) => {
          const votedBy = votesByBook[b.id] || [];
          (booksByPoll[b.poll_id] = booksByPoll[b.poll_id] || []).push({
            id: b.id,
            title: b.title,
            author: b.author,
            cover: b.cover,
            description: b.description,
            key: b.ol_key,
            voteCount: votedBy.length,
            votedBy: votedBy
          });
        });
        const polls = data.polls.map((p) => ({
          id: p.id,
          createdBy: p.created_by,
          createdAt: p.created_at,
          books: booksByPoll[p.id] || []
        }));

        const currentBook = data.currentBook.length > 0 ? {
          title: data.currentBook[0].title,
          author: data.currentBook[0].author,
          cover: data.currentBook[0].cover,
          description: data.currentBook[0].description
        } : null;

        res.json({
          id: clubId,
          clubTitle: c.title,
          managerUsername: c.manager_username,
          managerNickname: c.manager_nickname,
          description: c.description,
          background: c.background,
          maxMembers: c.max_members,
          createdAt: c.created_at,
          members: members,
          announcements: announcements,
          currentBook: currentBook,
          booksRead: booksRead,
          meetings: meetings,
          polls: polls
        });
      }

      step("members",
        "SELECT cm.username, u.nickname, u.join_date FROM club_members cm " +
        "JOIN users u ON u.username = cm.username WHERE cm.club_id = ? ORDER BY u.nickname", [clubId]);
      step("memberClubs",
        "SELECT cm2.username, c2.title AS club_name, c2.manager_username FROM club_members cm2 " +
        "JOIN clubs c2 ON c2.id = cm2.club_id " +
        "WHERE cm2.username IN (SELECT username FROM club_members WHERE club_id = ?)", [clubId]);
      step("announcements",
        "SELECT a.id, a.text, a.created_at, a.author_username, u.nickname AS from_nick FROM announcements a " +
        "JOIN users u ON u.username = a.author_username WHERE a.club_id = ? ORDER BY a.created_at DESC, a.id DESC", [clubId]);
      step("meetings",
        "SELECT id, title, location, meeting_datetime, created_at FROM meetings WHERE club_id = ? ORDER BY meeting_datetime", [clubId]);
      step("currentBook",
        "SELECT title, author, cover, description FROM current_books WHERE club_id = ?", [clubId]);
      step("booksRead",
        "SELECT id, title, author, cover, description FROM books_read WHERE club_id = ? ORDER BY id", [clubId]);
      step("bookRatings",
        "SELECT br.book_read_id, br.username, br.rating FROM book_ratings br " +
        "JOIN books_read b ON b.id = br.book_read_id WHERE b.club_id = ?", [clubId]);
      step("polls",
        "SELECT id, created_by, created_at FROM polls WHERE club_id = ? ORDER BY id", [clubId]);
      step("pollBooks",
        "SELECT pb.id, pb.poll_id, pb.title, pb.author, pb.cover, pb.description, pb.ol_key FROM poll_books pb " +
        "JOIN polls p ON p.id = pb.poll_id WHERE p.club_id = ? ORDER BY pb.id", [clubId]);
      step("pollVotes",
        "SELECT pv.poll_book_id, pv.username FROM poll_votes pv " +
        "JOIN poll_books pb ON pb.id = pv.poll_book_id " +
        "JOIN polls p ON p.id = pb.poll_id WHERE p.club_id = ?", [clubId]);
    }
  );
};

// POST /api/clubs — create a club; manager also becomes a member.
const createClub = function (req, res) {
  const { title, manager, description, background, maxMembers } = req.body;

  if (!title || !description || !manager) {
    return fail(req, res, 400, "Missing required fields.");
  }
  if (title.length > 40) {
    return fail(req, res, 400, "Club name must be 40 characters or fewer.");
  }

  sql.query("SELECT id FROM clubs WHERE title = ?", [title], (err, rows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    if (rows.length > 0) return fail(req, res, 409, "A club with this name already exists.");

    sql.query(
      "INSERT INTO clubs (title, manager_username, description, background, max_members) VALUES (?,?,?,?,?)",
      [title, manager, description, background || null, maxMembers || 20],
      (err2, result) => {
        if (err2) {
          if (err2.code === "ER_DUP_ENTRY") {
            return fail(req, res, 409, "You already manage a club. Each member can manage only one.");
          }
          console.log("error:", err2);
          return fail(req, res, 400, "DB error.");
        }
        sql.query(
          "INSERT INTO club_members (club_id, username) VALUES (?, ?)",
          [result.insertId, manager],
          (err3) => {
            if (err3) { console.log("error:", err3); return fail(req, res, 400, "DB error."); }
            if (wantsJSON(req)) {
              return res.status(201).json({ message: "Club created", clubId: result.insertId, title });
            }
            res.redirect("/club.html?clubTitle=" + encodeURIComponent(title));
          }
        );
      }
    );
  });
};

// PUT /api/clubs/:title — update description, max_members, background (name immutable).
const updateClub = function (req, res) {
  const title = req.params.title;
  const { manager, description, maxMembers, background } = req.body;

  if (!description) return fail(req, res, 400, "Description is required.");

  sql.query("SELECT id, manager_username FROM clubs WHERE title = ?", [title], (err, rows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    if (rows.length === 0) return fail(req, res, 404, "Club not found.");
    if (manager && rows[0].manager_username !== manager) {
      return fail(req, res, 403, "Only the club manager can edit this club.");
    }
    sql.query(
      "UPDATE clubs SET description = ?, max_members = ?, background = ? WHERE id = ?",
      [description, maxMembers || 20, background || null, rows[0].id],
      (err2) => {
        if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
        if (wantsJSON(req)) return res.json({ message: "Club updated", title });
        res.redirect("/club.html?clubTitle=" + encodeURIComponent(title));
      }
    );
  });
};

// DELETE /api/clubs/:title — delete a club (CASCADE removes children).
const deleteClub = function (req, res) {
  const title = req.params.title;
  const { manager } = req.body;

  sql.query("SELECT id, manager_username FROM clubs WHERE title = ?", [title], (err, rows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    if (rows.length === 0) return fail(req, res, 404, "Club not found.");
    if (manager && rows[0].manager_username !== manager) {
      return fail(req, res, 403, "Only the club manager can delete this club.");
    }
    sql.query("DELETE FROM clubs WHERE id = ?", [rows[0].id], (err2) => {
      if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
      res.json({ message: "Club deleted" });
    });
  });
};

// POST /api/clubs/:title/join — add the current user to the club.
const joinClub = function (req, res) {
  const title = req.params.title;
  const { username } = req.body;
  if (!username) return fail(req, res, 400, "Missing username.");

  sql.query("SELECT id, max_members FROM clubs WHERE title = ?", [title], (err, rows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    if (rows.length === 0) return fail(req, res, 404, "Club not found.");
    const clubId = rows[0].id;
    const maxMembers = rows[0].max_members;

    sql.query("SELECT COUNT(*) AS n FROM club_members WHERE club_id = ?", [clubId], (err2, cRows) => {
      if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
      sql.query("SELECT 1 FROM club_members WHERE club_id = ? AND username = ?", [clubId, username], (err3, mRows) => {
        if (err3) { console.log("error:", err3); return fail(req, res, 400, "DB error."); }
        if (mRows.length > 0) return fail(req, res, 409, "You are already a member of this club.");
        if (cRows[0].n >= maxMembers) return fail(req, res, 409, "This club is full and cannot accept new members.");

        sql.query("INSERT INTO club_members (club_id, username) VALUES (?, ?)", [clubId, username], (err4) => {
          if (err4) { console.log("error:", err4); return fail(req, res, 400, "DB error."); }
          res.json({ message: "Joined club" });
        });
      });
    });
  });
};

// POST /api/clubs/:title/leave — remove the current user from the club.
const leaveClub = function (req, res) {
  const title = req.params.title;
  const { username } = req.body;
  if (!username) return fail(req, res, 400, "Missing username.");

  sql.query("SELECT id, manager_username FROM clubs WHERE title = ?", [title], (err, rows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    if (rows.length === 0) return fail(req, res, 404, "Club not found.");
    if (rows[0].manager_username === username) {
      return fail(req, res, 400, "The manager cannot leave the club. Delete it instead.");
    }
    sql.query("DELETE FROM club_members WHERE club_id = ? AND username = ?", [rows[0].id, username], (err2) => {
      if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
      res.json({ message: "Left club" });
    });
  });
};

// PUT /api/clubs/:title/current-book — set/replace the club's current book.
const setCurrentBook = function (req, res) {
  const title = req.params.title;
  const { manager, book } = req.body;
  const b = book || req.body; // accept either {book:{...}} or flat fields
  if (!b || !b.title) return fail(req, res, 400, "A book title is required.");

  sql.query("SELECT id, manager_username FROM clubs WHERE title = ?", [title], (err, rows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    if (rows.length === 0) return fail(req, res, 404, "Club not found.");
    if (manager && rows[0].manager_username !== manager) {
      return fail(req, res, 403, "Only the club manager can set the current book.");
    }
    sql.query(
      "INSERT INTO current_books (club_id, title, author, cover, description) VALUES (?,?,?,?,?) " +
      "ON DUPLICATE KEY UPDATE title = VALUES(title), author = VALUES(author), cover = VALUES(cover), description = VALUES(description)",
      [rows[0].id, b.title, b.author || null, b.cover || null, b.description || null],
      (err2) => {
        if (err2) { console.log("error:", err2); return fail(req, res, 400, "DB error."); }
        res.json({ message: "Current book set" });
      }
    );
  });
};

module.exports = {
  getAllClubs,
  getClub,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub,
  setCurrentBook
};
