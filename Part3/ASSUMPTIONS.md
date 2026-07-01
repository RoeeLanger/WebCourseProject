# Assumptions

Working assumptions made for Part C. None contradict the brief; they are documented
here as allowed.

1. **Session pointer in localStorage.** The course did not cover server-side sessions or
   cookies, so the logged-in username is kept client-side in
   `localStorage.bookies_session` (set on login, cleared on logout). It is the *only*
   thing in the browser's storage and holds no application data. When a request needs
   "the current user," the client sends that username to the server (in the body for
   writes, in the path/query for reads). Because of this, authorization uses the username
   supplied by the client, and the no-JS form fallbacks for authenticated actions are
   limited (the server cannot know who is logged in without the pointer) — the forms still
   have real `action`/`method` and the endpoints work, but the full experience uses
   `fetch`.

2. **Plaintext passwords.** Passwords are stored as plaintext, consistent with Part 2 and
   the lecture scope (no hashing was taught).

3. **`managedClub` is derived, not stored.** A user's managed club is derived from
   `clubs.manager_username` (and the `UNIQUE` constraint on that column enforces
   one managed club per user) rather than being stored on the user.

4. **Two fixed security questions.** Each user has exactly two security-question/answer
   pairs (two columns each), matching the registration UI which offers exactly two slots.
   Security answers are compared case-insensitively.

5. **Modular `crud/` split.** Request handlers are split into per-resource files under
   `crud/` (rather than one `CRUD_functions.js`) for readability — the app has 11 tables.
   `crud/helpers.js` holds the shared dual-mode response helper and validators.

6. **Connection pool.** `db.js` uses a `mysql2` connection **pool** (a drop-in for a single
   connection with the same callback `.query()` API) so the app survives idle timeouts.
   `dateStrings: true` is set so `DATETIME` values come back as literal
   `"YYYY-MM-DD HH:MM:SS"` strings (wall-clock), preventing meeting times and join dates
   from drifting through UTC conversion.

7. **Asset folder casing.** The Part 2 `Videos/` folder was renamed to lowercase
   `public/videos/` so static serving works on case-sensitive (Linux) file systems; all
   references already used lowercase `videos/`.

8. **Progressive-enhancement forms.** Every form has a real `action` and `method` so it
   posts to its server route on a plain submit; client JS enhances the same endpoints with
   `fetch` for inline validation and no-reload UX. Handlers detect fetch vs. plain submit
   (via the `Accept` header) and respond with JSON or a redirect accordingly.

9. **Voting model.** The poll UI lets a member select up to two books. A vote submission
   replaces that member's previous selections in the poll (prior `poll_votes` rows for the
   poll are cleared, then the new ones inserted). Vote counts are derived from
   `COUNT(poll_votes)`.

10. **Ending a vote.** "End the vote" is modelled as: move the old current book into the
    read history, set the winning book (highest vote count, ties to the first) as the new
    current book, then delete the poll (its books and votes cascade away). There is no
    separate "ended poll" state — an ended poll is simply removed.

11. **Open Library stays client-side.** `public/js/books.js` calls the external Open Library
    API directly from the browser; it is an external data source, not Bookies app data, so
    it was left unchanged.
