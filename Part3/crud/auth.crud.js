const sql = require("../db.js");
const { wantsJSON, fail, isValidEmail, isValidPassword } = require("./helpers.js");

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

// POST /api/register — create a user.
// Body: username, nickname, email, password, q1, a1, q2, a2
const register = function (req, res) {
  const { username, nickname, email, password, q1, a1, q2, a2 } = req.body;

  // ---- required fields ----
  if (!username || !nickname || !email || !password || !q1 || !a1 || !q2 || !a2) {
    return fail(req, res, 400, "All fields are required.");
  }
  // ---- field rules (mirror the client; the client can be bypassed) ----
  if (username.length < 3 || !USERNAME_RE.test(username)) {
    return fail(req, res, 400, "Username must be at least 3 characters and use only letters, numbers and underscores.");
  }
  if (nickname.length < 2) {
    return fail(req, res, 400, "Nickname must be at least 2 characters.");
  }
  if (!isValidEmail(email)) {
    return fail(req, res, 400, "Please enter a valid email address.");
  }
  if (!isValidPassword(password)) {
    return fail(req, res, 400, "Password must be at least 8 characters with one uppercase letter, one lowercase letter, and one number.");
  }
  if (q1 === q2) {
    return fail(req, res, 400, "Please choose two different security questions.");
  }

  // ---- uniqueness (collation is case-insensitive; this gives friendly messages) ----
  sql.query(
    "SELECT username, email FROM users WHERE username = ? OR email = ?",
    [username, email],
    (err, rows) => {
      if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }

      const lcU = username.toLowerCase();
      const lcE = email.toLowerCase();
      if (rows.some((r) => r.username.toLowerCase() === lcU)) {
        return fail(req, res, 409, "This username is already taken.");
      }
      if (rows.some((r) => r.email.toLowerCase() === lcE)) {
        return fail(req, res, 409, "An account with this email already exists.");
      }

      sql.query(
        "INSERT INTO users (username, nickname, email, password, security_question_1, security_answer_1, security_question_2, security_answer_2) VALUES (?,?,?,?,?,?,?,?)",
        [username, nickname, email, password, q1, a1, q2, a2],
        (err2) => {
          if (err2) {
            if (err2.code === "ER_DUP_ENTRY") {
              return fail(req, res, 409, "That username or email is already in use.");
            }
            console.log("error:", err2);
            return fail(req, res, 400, "DB error.");
          }
          if (wantsJSON(req)) {
            return res.status(201).json({ message: "Account created", username });
          }
          res.redirect("/login.html");
        }
      );
    }
  );
};

// POST /api/login — verify credentials.
// Body: email, password
const login = function (req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return fail(req, res, 400, "Email and password are required.");
  }

  sql.query(
    "SELECT username, password FROM users WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
      // Same 401 for unknown email and wrong password (don't reveal which).
      if (rows.length === 0 || rows[0].password !== password) {
        return fail(req, res, 401, "Incorrect email or password.");
      }
      if (wantsJSON(req)) {
        return res.json({ username: rows[0].username });
      }
      // No-JS fallback: the session pointer lives client-side, so a plain submit
      // can only best-effort redirect (profile.html requires the pointer).
      res.redirect("/profile.html");
    }
  );
};

// POST /api/forgot/lookup — find a user by email, return their 2 questions.
// Body: email
const forgotLookup = function (req, res) {
  const { email } = req.body;
  if (!isValidEmail(email)) {
    return fail(req, res, 400, "Please enter a valid email address.");
  }
  sql.query(
    "SELECT security_question_1, security_question_2 FROM users WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
      if (rows.length === 0) {
        return fail(req, res, 404, "No account found with that email address.");
      }
      res.json({
        question1: rows[0].security_question_1,
        question2: rows[0].security_question_2
      });
    }
  );
};

// POST /api/forgot/verify — check one security answer.
// Body: email, questionIndex (1 | 2), answer
const forgotVerify = function (req, res) {
  const { email, questionIndex, answer } = req.body;
  if (!email || !questionIndex || !answer) {
    return fail(req, res, 400, "Missing required fields.");
  }
  const idx = Number(questionIndex);
  if (idx !== 1 && idx !== 2) {
    return fail(req, res, 400, "Invalid question.");
  }
  sql.query(
    "SELECT security_answer_1, security_answer_2 FROM users WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
      if (rows.length === 0) {
        return fail(req, res, 404, "No account found with that email address.");
      }
      const correct = idx === 1 ? rows[0].security_answer_1 : rows[0].security_answer_2;
      if (String(answer).trim().toLowerCase() === String(correct).trim().toLowerCase()) {
        return res.json({ verified: true });
      }
      return fail(req, res, 401, "That answer is incorrect. Try again or switch questions.");
    }
  );
};

// POST /api/forgot/reset — set a new password.
// Body: email, newPassword
const forgotReset = function (req, res) {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return fail(req, res, 400, "Missing required fields.");
  }
  if (!isValidPassword(newPassword)) {
    return fail(req, res, 400, "Password must be at least 8 characters with one uppercase letter, one lowercase letter, and one number.");
  }
  sql.query(
    "UPDATE users SET password = ? WHERE email = ?",
    [newPassword, email],
    (err, result) => {
      if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
      if (result.affectedRows === 0) {
        return fail(req, res, 404, "No account found with that email address.");
      }
      if (wantsJSON(req)) {
        return res.json({ message: "Password updated" });
      }
      res.redirect("/login.html?reset=success");
    }
  );
};

// GET /api/check-email?email=... — duplicate email check (register blur).
const checkEmail = function (req, res) {
  const email = req.query.email;
  if (!email) return res.json({ exists: false });
  sql.query("SELECT username FROM users WHERE email = ?", [email], (err, rows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    res.json({ exists: rows.length > 0 });
  });
};

// GET /api/check-username?username=... — duplicate username check.
const checkUsername = function (req, res) {
  const username = req.query.username;
  if (!username) return res.json({ exists: false });
  sql.query("SELECT username FROM users WHERE username = ?", [username], (err, rows) => {
    if (err) { console.log("error:", err); return fail(req, res, 400, "DB error."); }
    res.json({ exists: rows.length > 0 });
  });
};

module.exports = {
  register,
  login,
  forgotLookup,
  forgotVerify,
  forgotReset,
  checkEmail,
  checkUsername
};
