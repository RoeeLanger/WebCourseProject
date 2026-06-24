-- Bookies relational schema.
-- Replaces the old localStorage keys (bookies_session, bookies_users, bookies_clubs).
-- Nested arrays/objects from the old JSON become proper tables.

CREATE DATABASE IF NOT EXISTS bookies
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bookies;

-- Drop in reverse-dependency order so the script is re-runnable.
DROP TABLE IF EXISTS book_ratings, books_read, poll_votes, poll_books, polls,
                     current_books, meetings, announcements, club_members, clubs, users;

CREATE TABLE users (
  username             VARCHAR(50)  NOT NULL PRIMARY KEY,
  nickname             VARCHAR(50)  NOT NULL,
  email                VARCHAR(255) NOT NULL UNIQUE,
  password             VARCHAR(255) NOT NULL,             -- plaintext, see ASSUMPTIONS.md
  security_question_1  VARCHAR(255) NOT NULL,
  security_answer_1    VARCHAR(255) NOT NULL,
  security_question_2  VARCHAR(255) NOT NULL,
  security_answer_2    VARCHAR(255) NOT NULL,
  join_date            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE clubs (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  title             VARCHAR(40)  NOT NULL UNIQUE,
  manager_username  VARCHAR(50)  NOT NULL UNIQUE,         -- UNIQUE => one managed club per user
  description       VARCHAR(255) NOT NULL,
  background        VARCHAR(255) DEFAULT NULL,
  max_members       INT          NOT NULL DEFAULT 20,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_username) REFERENCES users(username) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE club_members (
  club_id    INT          NOT NULL,
  username   VARCHAR(50)  NOT NULL,
  joined_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (club_id, username),
  FOREIGN KEY (club_id)  REFERENCES clubs(id)       ON DELETE CASCADE,
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE announcements (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  club_id          INT          NOT NULL,
  author_username  VARCHAR(50)  NOT NULL,
  text             TEXT         NOT NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id)         REFERENCES clubs(id)       ON DELETE CASCADE,
  FOREIGN KEY (author_username) REFERENCES users(username) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- display "from" = author's nickname (JOIN users); display date = formatted created_at

CREATE TABLE meetings (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  club_id           INT          NOT NULL,
  title             VARCHAR(255) NOT NULL,
  location          VARCHAR(255) DEFAULT NULL,
  meeting_datetime  DATETIME     NOT NULL,                -- from datetime-local "YYYY-MM-DDTHH:MM"
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE current_books (
  club_id      INT          NOT NULL PRIMARY KEY,         -- 1:1 with club
  title        VARCHAR(255) NOT NULL,
  author       VARCHAR(255) DEFAULT NULL,
  cover        VARCHAR(500) DEFAULT NULL,
  description  TEXT         DEFAULT NULL,
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE polls (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  club_id     INT          NOT NULL,
  created_by  VARCHAR(50)  NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id)    REFERENCES clubs(id)       ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(username) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE poll_books (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  poll_id      INT          NOT NULL,
  title        VARCHAR(255) NOT NULL,
  author       VARCHAR(255) DEFAULT NULL,
  cover        VARCHAR(500) DEFAULT NULL,
  description  TEXT         DEFAULT NULL,
  ol_key       VARCHAR(255) DEFAULT NULL,                 -- Open Library "key"
  FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE poll_votes (
  poll_book_id  INT          NOT NULL,
  username      VARCHAR(50)  NOT NULL,
  PRIMARY KEY (poll_book_id, username),                   -- can't vote same book twice
  FOREIGN KEY (poll_book_id) REFERENCES poll_books(id)    ON DELETE CASCADE,
  FOREIGN KEY (username)     REFERENCES users(username)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- vote_count is derived: COUNT(poll_votes). One-vote-per-poll enforced in app logic.

CREATE TABLE books_read (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  club_id      INT          NOT NULL,
  title        VARCHAR(255) NOT NULL,
  author       VARCHAR(255) DEFAULT NULL,
  cover        VARCHAR(500) DEFAULT NULL,
  description  TEXT         DEFAULT NULL,
  FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE book_ratings (
  book_read_id  INT          NOT NULL,
  username      VARCHAR(50)  NOT NULL,
  rating        TINYINT      NOT NULL,                    -- 1..5 (validated in app)
  PRIMARY KEY (book_read_id, username),
  FOREIGN KEY (book_read_id) REFERENCES books_read(id)    ON DELETE CASCADE,
  FOREIGN KEY (username)     REFERENCES users(username)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
