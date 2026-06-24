// Shared helpers for the crud handlers.

// Detect whether the caller wants a JSON response (fetch / XHR) versus a plain
// browser form submit that should be answered with a redirect / HTML.
// api.js sends `Accept: application/json` so fetch is reliably detected.
function wantsJSON(req) {
  return req.xhr || (req.headers.accept || "").includes("application/json");
}

// Respond to an error in dual mode: JSON for fetch, plain text for form submit.
function fail(req, res, status, message) {
  if (wantsJSON(req)) return res.status(status).json({ error: message });
  return res.status(status).send(message);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_RE.test(email.trim());
}

// Password policy: >= 8 chars, at least one uppercase, one lowercase, one digit.
function isValidPassword(pw) {
  return (
    typeof pw === "string" &&
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw)
  );
}

module.exports = { wantsJSON, fail, isValidEmail, isValidPassword };
