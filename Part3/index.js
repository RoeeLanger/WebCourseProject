const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

// --- middleware ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// --- crud modules ---
const auth = require("./crud/auth.crud.js");
const users = require("./crud/users.crud.js");
const clubs = require("./crud/clubs.crud.js");
const announcements = require("./crud/announcements.crud.js");
const meetings = require("./crud/meetings.crud.js");
const polls = require("./crud/polls.crud.js");
const booksRead = require("./crud/booksRead.crud.js");

// --- auth ---
app.post("/api/register", auth.register);
app.post("/api/login", auth.login);
app.post("/api/forgot/lookup", auth.forgotLookup);
app.post("/api/forgot/verify", auth.forgotVerify);
app.post("/api/forgot/reset", auth.forgotReset);
app.get("/api/check-email", auth.checkEmail);
app.get("/api/check-username", auth.checkUsername);

// --- users ---
app.get("/api/users/:username", users.getUser);
app.get("/api/users/:username/meetings", users.getUserMeetings);

// --- clubs ---
app.get("/api/clubs", clubs.getAllClubs);
app.get("/api/clubs/:title", clubs.getClub);
app.post("/api/clubs", clubs.createClub);
app.put("/api/clubs/:title", clubs.updateClub);
app.delete("/api/clubs/:title", clubs.deleteClub);
app.post("/api/clubs/:title/join", clubs.joinClub);
app.post("/api/clubs/:title/leave", clubs.leaveClub);
app.put("/api/clubs/:title/current-book", clubs.setCurrentBook);

// --- announcements ---
app.post("/api/clubs/:title/announcements", announcements.add);
app.delete("/api/announcements/:id", announcements.remove);

// --- meetings ---
app.post("/api/clubs/:title/meetings", meetings.add);
app.put("/api/meetings/:id", meetings.update);
app.delete("/api/meetings/:id", meetings.remove);

// --- polls ---
app.post("/api/clubs/:title/polls", polls.create);
app.post("/api/polls/:pollId/vote", polls.vote);
app.delete("/api/polls/:pollId", polls.end);

// --- books read ---
app.post("/api/clubs/:title/books-read", booksRead.add);
app.put("/api/books-read/:id/rating", booksRead.setRating);

// Unknown API route -> clean 404 JSON (instead of falling through to static).
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found." });
});

// Error handler: keeps a bad request (e.g. malformed JSON body) from leaking a
// stack trace or crashing the process; logs server-side, returns a safe message.
app.use((err, req, res, next) => {
  console.log("error:", err && err.message);
  res.status(err.status || 400).json({ error: "Invalid request." });
});

app.listen(port, () => console.log(`Bookies server running on port ${port}.`));
