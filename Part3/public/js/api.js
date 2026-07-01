// ============================================
//  Bookies — API client
//  The single place the front-end talks to the server. Page scripts call
//  Api.* methods and never touch fetch details directly.
// ============================================
const Api = {
  // --- low-level helpers ---
  async getJSON(url) {
    const r = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  async send(url, method, body) {
    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(body || {})
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },

  // --- session pointer (the only client-side state) ---
  currentUsername() { return localStorage.getItem("bookies_session"); },
  setSession(username) { localStorage.setItem("bookies_session", username); },
  clearSession() { localStorage.removeItem("bookies_session"); },
  // Redirect to login if there is no session pointer. Returns the username.
  requireLogin() {
    const u = this.currentUsername();
    if (!u) { window.location.href = "login.html"; return null; }
    return u;
  },

  // --- auth ---
  login(email, password) { return this.send("/api/login", "POST", { email, password }); },
  register(payload)       { return this.send("/api/register", "POST", payload); },
  checkEmail(email)       { return this.getJSON("/api/check-email?email=" + encodeURIComponent(email)); },
  checkUsername(username) { return this.getJSON("/api/check-username?username=" + encodeURIComponent(username)); },
  forgotLookup(email)                       { return this.send("/api/forgot/lookup", "POST", { email }); },
  forgotVerify(email, questionIndex, answer){ return this.send("/api/forgot/verify", "POST", { email, questionIndex, answer }); },
  forgotReset(email, newPassword)           { return this.send("/api/forgot/reset", "POST", { email, newPassword }); },

  // --- users ---
  getUser(username)         { return this.getJSON("/api/users/" + encodeURIComponent(username)); },
  getUserMeetings(username) { return this.getJSON("/api/users/" + encodeURIComponent(username) + "/meetings"); },

  // --- clubs ---
  getClubs()        { return this.getJSON("/api/clubs"); },
  getClub(title)    { return this.getJSON("/api/clubs/" + encodeURIComponent(title)); },
  createClub(payload) { return this.send("/api/clubs", "POST", payload); },
  updateClub(title, payload) { return this.send("/api/clubs/" + encodeURIComponent(title), "PUT", payload); },
  deleteClub(title, manager) { return this.send("/api/clubs/" + encodeURIComponent(title), "DELETE", { manager }); },
  joinClub(title, username)  { return this.send("/api/clubs/" + encodeURIComponent(title) + "/join", "POST", { username }); },
  leaveClub(title, username) { return this.send("/api/clubs/" + encodeURIComponent(title) + "/leave", "POST", { username }); },
  setCurrentBook(title, manager, book) { return this.send("/api/clubs/" + encodeURIComponent(title) + "/current-book", "PUT", { manager, book }); },

  // --- announcements ---
  addAnnouncement(title, text) { return this.send("/api/clubs/" + encodeURIComponent(title) + "/announcements", "POST", { text, username: this.currentUsername() }); },
  deleteAnnouncement(id)       { return this.send("/api/announcements/" + id, "DELETE", { username: this.currentUsername() }); },

  // --- meetings ---
  addMeeting(title, meeting)   { return this.send("/api/clubs/" + encodeURIComponent(title) + "/meetings", "POST", Object.assign({ username: this.currentUsername() }, meeting)); },
  updateMeeting(id, meeting)   { return this.send("/api/meetings/" + id, "PUT", Object.assign({ username: this.currentUsername() }, meeting)); },
  deleteMeeting(id)            { return this.send("/api/meetings/" + id, "DELETE", { username: this.currentUsername() }); },

  // --- polls ---
  createPoll(title, books)     { return this.send("/api/clubs/" + encodeURIComponent(title) + "/polls", "POST", { createdBy: this.currentUsername(), books }); },
  vote(pollId, pollBookIds)    { return this.send("/api/polls/" + pollId + "/vote", "POST", { username: this.currentUsername(), pollBookIds }); },
  endPoll(pollId)              { return this.send("/api/polls/" + pollId, "DELETE", { username: this.currentUsername() }); },

  // --- books read + ratings ---
  addBookRead(title, book)     { return this.send("/api/clubs/" + encodeURIComponent(title) + "/books-read", "POST", Object.assign({ username: this.currentUsername() }, book)); },
  setRating(bookReadId, rating){ return this.send("/api/books-read/" + bookReadId + "/rating", "PUT", { username: this.currentUsername(), rating }); }
};
