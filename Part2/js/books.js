// books.js — Book object factory and Open Library API search

// A Book object holds all the info we display throughout the app.
// voteCount and votedBy are included so Books can live directly inside poll entries.
function createBook({ title, author, cover, description, key }) {
  return {
    title:       title       || "Unknown Title",
    author:      author      || "Unknown Author",
    cover:       cover       || null,   // absolute URL from Covers API, or null
    description: description || "No description available.",
    key:         key         || null,   // Open Library works key e.g. "/works/OL45804W"
    voteCount:   0,
    votedBy:     [],                    // usernames that voted for this book in the active poll
  };
}

// Searches Open Library for the best match to `title`.
// Makes two requests: a Search request (fast) then a Works request (for description).
// Returns a Book object, or null if nothing was found.
async function searchBook(title) {
  const encoded = encodeURIComponent(title.trim());

  // Fetch only the fields we actually use to keep the payload small
  const searchResp = await fetch(
    `https://openlibrary.org/search.json?title=${encoded}&limit=1&fields=key,title,author_name,cover_i`
  );
  const searchData = await searchResp.json();

  if (!searchData.docs || searchData.docs.length === 0) return null;

  const doc = searchData.docs[0];

  // Try to get a human-readable description from the Works endpoint
  let description = "";
  if (doc.key) {
    try {
      const workResp = await fetch(`https://openlibrary.org${doc.key}.json`);
      const work     = await workResp.json();
      if (work.description) {
        // description can be a plain string or { value: "..." }
        description = typeof work.description === "string"
          ? work.description
          : (work.description.value || "");
      }
    } catch (_) {
      // Description is optional — silently continue without it
    }
  }

  return createBook({
    title:       doc.title,
    author:      doc.author_name?.[0] ?? "Unknown Author",
    // cover_i is the numeric cover ID → plug into Covers API for a Large image
    cover:       doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null,
    description: description,
    key:         doc.key,
  });
}
