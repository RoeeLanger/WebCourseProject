# Bookies — Part C (Express + MySQL)

The Bookies book-club app, with its data layer migrated from browser `localStorage`
to a **MySQL** database accessed through an **Express** server. The only thing kept in
the browser is a single session pointer (the logged-in username); every piece of
application data — users, clubs, members, announcements, meetings, polls, votes,
current book, books read, ratings — lives in MySQL and is read/written through the
server API.

## Requirements

- Node.js (project developed on Node 18+; CommonJS)
- MySQL Server 8.x running locally

## Setup

```bash
cd Part3
npm install
```

### 1. Configure the database connection

Copy the template and fill in your local MySQL root password:

```bash
cp db.config.example.js db.config.js
```

```js
// db.config.js  (gitignored — never committed)
module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "your-mysql-password",
  DB: "bookies"
};
```

### 2. Create the schema and load the demo data

Run both SQL scripts (via the MySQL CLI or MySQL Workbench). Use the `utf8mb4`
charset flag so the seed's accented names (e.g. *Brontë*) and en/em dashes load
correctly:

```bash
mysql -u root -p --default-character-set=utf8mb4 < database/schema.sql
mysql -u root -p --default-character-set=utf8mb4 bookies < database/seed.sql
```

`schema.sql` creates the `bookies` database and 11 tables (it drops them first, so it
is re-runnable). `seed.sql` loads 8 demo users, 2 clubs, and all their nested data.

### 3. Run the server

```bash
npm run dev     # nodemon (auto-restart)   — or:
npm start       # node index.js
```

Open **http://localhost:3000/**.

## Demo accounts

All 8 seeded users share the password **`Bookworm1`**. Examples:

| Email                   | Role                                   |
|-------------------------|----------------------------------------|
| `vanessa@bookies.demo`  | Manager of *Fantasy Lovers*            |
| `theo@bookies.demo`     | Manager of *Classic Lit Society*       |
| `luna@bookies.demo`     | Member of both clubs                   |

## Project structure

```
Part3/
├── index.js                # Express app: middleware + all route definitions
├── db.js                   # mysql2 connection pool (exports the connection)
├── db.config.js            # local credentials (gitignored)
├── db.config.example.js    # committed template
├── crud/                   # request handlers, split by resource
│   ├── helpers.js          # dual-mode response + validators
│   ├── auth.crud.js        # register, login, forgot-password, duplicate checks
│   ├── users.crud.js       # profile reads, user meetings
│   ├── clubs.crud.js       # club CRUD, join/leave, current book, full hydration
│   ├── announcements.crud.js
│   ├── meetings.crud.js
│   ├── polls.crud.js       # polls + votes
│   └── booksRead.crud.js   # books read + ratings
├── database/
│   ├── schema.sql          # CREATE DATABASE + 11 tables
│   └── seed.sql            # demo data (translated from the old js/seed.js)
└── public/                 # the front-end, served statically
    ├── *.html
    ├── css/
    └── js/
        ├── api.js          # the single fetch wrapper — all server calls live here
        ├── components.js, login.js, register.js, forgotPassword.js,
        │   profile.js, create-club.js, calendar.js, books.js
        └── (club page logic is inline in club.html)
```

## API overview

All application data is served under `/api` (JSON). Forms also post to these paths
directly so they work without JavaScript; client JS progressively enhances them with
`fetch`. Handlers return meaningful status codes: `200/201` success, `400` bad input,
`401` bad credentials, `403` forbidden, `404` not found, `409` conflict.

- **Auth:** `POST /api/register`, `POST /api/login`, `POST /api/forgot/{lookup,verify,reset}`,
  `GET /api/check-email`, `GET /api/check-username`
- **Users:** `GET /api/users/:username`, `GET /api/users/:username/meetings`
- **Clubs:** `GET /api/clubs`, `GET /api/clubs/:title`, `POST /api/clubs`,
  `PUT /api/clubs/:title`, `DELETE /api/clubs/:title`,
  `POST /api/clubs/:title/{join,leave}`, `PUT /api/clubs/:title/current-book`
- **Announcements:** `POST /api/clubs/:title/announcements`, `DELETE /api/announcements/:id`
- **Meetings:** `POST /api/clubs/:title/meetings`, `PUT /api/meetings/:id`, `DELETE /api/meetings/:id`
- **Polls:** `POST /api/clubs/:title/polls`, `POST /api/polls/:pollId/vote`, `DELETE /api/polls/:pollId`
- **Books read / ratings:** `POST /api/clubs/:title/books-read`, `PUT /api/books-read/:id/rating`

See [ASSUMPTIONS.md](ASSUMPTIONS.md) for the working assumptions made in this submission.
