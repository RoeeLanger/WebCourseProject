-- Bookies demo data, translated faithfully from public/js/seed.js.
-- Run AFTER schema.sql. Load with utf8mb4 so en/em dashes and accented names
-- (Brontë, etc.) survive:  mysql -u root -p --default-character-set=utf8mb4 bookies < database/seed.sql
USE bookies;

-- =====================================================================
-- USERS (8) — all keep the demo password "Bookworm1"
-- =====================================================================
INSERT INTO users
  (username, nickname, email, password, security_question_1, security_answer_1, security_question_2, security_answer_2, join_date)
VALUES
  ('vanessa_reads','Vanessa','vanessa@bookies.demo','Bookworm1',
   'What is your favorite book?','The Way of Kings',
   'What is the first book you remember reading?','Harry Potter','2024-01-15 10:00:00'),
  ('theo_page','Theo','theo@bookies.demo','Bookworm1',
   'Which book have you re-read the most?','Pride and Prejudice',
   'Who is your favorite fictional character?','Atticus Finch','2024-02-01 09:00:00'),
  ('luna_m','Luna','luna@bookies.demo','Bookworm1',
   'What was your childhood nickname?','Lulu',
   'Which fictional place would you most like to live in?','Rivendell','2024-03-10 14:00:00'),
  ('sam_bookworm','Sam','sam@bookies.demo','Bookworm1',
   'What is your favorite book?','To Kill a Mockingbird',
   'Who is your favorite fictional character?','Elizabeth Bennet','2024-04-05 11:00:00'),
  ('river_wolf','River','river@bookies.demo','Bookworm1',
   'Which fictional place would you most like to live in?','The Shire',
   'What is your favorite book?','The Hobbit','2024-05-20 08:00:00'),
  ('maya_reads','Maya','maya@bookies.demo','Bookworm1',
   'Who is your favorite fictional character?','Hermione Granger',
   'Which book have you re-read the most?','The Eye of the World','2024-06-01 12:00:00'),
  ('petra_b','Petra','petra@bookies.demo','Bookworm1',
   'What is the first book you remember reading?','The Neverending Story',
   'What was your childhood nickname?','Pete','2024-07-14 15:30:00'),
  ('kai_stories','Kai','kai@bookies.demo','Bookworm1',
   'Who is your favorite fictional character?','Raskolnikov',
   'What is your favorite book?','Crime and Punishment','2024-08-09 10:00:00');

-- =====================================================================
-- CLUBS (2) — capture each generated id in a user variable
-- =====================================================================
INSERT INTO clubs (title, manager_username, description, background, max_members, created_at) VALUES
  ('Fantasy Lovers','vanessa_reads',
   'A cozy reading club for fantasy fans — dragons, magic, morally grey characters and emotional damage.',
   'videos/288559_tiny.mp4', 15, '2024-01-15 10:30:00');
SET @fantasy = LAST_INSERT_ID();

INSERT INTO clubs (title, manager_username, description, background, max_members, created_at) VALUES
  ('Classic Lit Society','theo_page',
   'Rediscovering the timeless works of literature — from Austen to Dostoevsky. All readers welcome.',
   'videos/Fireplace_Background.mp4', 10, '2024-02-01 09:30:00');
SET @classic = LAST_INSERT_ID();

-- =====================================================================
-- CLUB MEMBERS (manager included, as in the seed)
-- =====================================================================
INSERT INTO club_members (club_id, username) VALUES
  (@fantasy,'vanessa_reads'),(@fantasy,'theo_page'),(@fantasy,'luna_m'),
  (@fantasy,'river_wolf'),(@fantasy,'maya_reads'),(@fantasy,'petra_b'),
  (@classic,'theo_page'),(@classic,'sam_bookworm'),(@classic,'luna_m'),
  (@classic,'maya_reads'),(@classic,'kai_stories');

-- =====================================================================
-- CURRENT BOOKS (1 per club)
-- =====================================================================
INSERT INTO current_books (club_id, title, author, cover, description) VALUES
  (@fantasy,'The Way of Kings','Brandon Sanderson',
   'https://covers.openlibrary.org/b/id/14658316-L.jpg',
   'Epic fantasy set in the storm-battered world of Roshar, following a surgeon-turned-soldier, a young woman searching for ancient knowledge, and a mysterious assassin. Book one of The Stormlight Archive.'),
  (@classic,'Pride and Prejudice','Jane Austen',
   'https://covers.openlibrary.org/b/id/14348537-L.jpg',
   'Witty and romantic, this beloved novel follows Elizabeth Bennet as she navigates questions of manners, marriage, and morality in Georgian England — and gradually sees past her first impressions of Mr. Darcy.');

-- =====================================================================
-- ANNOUNCEMENTS (newest first, as authored by each manager)
-- "from" nickname -> author_username; "date" string -> created_at DATETIME
-- =====================================================================
INSERT INTO announcements (club_id, author_username, text, created_at) VALUES
  (@fantasy,'vanessa_reads',
   'Hey everyone! Our next meeting is June 10th at 20:00. Come ready with thoughts on chapters 1–15 of The Way of Kings. Same Zoom link as always — see you there!',
   '2026-05-18 00:00:00'),
  (@fantasy,'vanessa_reads',
   'The poll for our next read is live! We''ve got three great options this time — go vote before June 1st.',
   '2026-05-10 00:00:00'),
  (@fantasy,'vanessa_reads',
   'Welcome to Fantasy Lovers! So excited to have you all here. Feel free to suggest books for our next poll.',
   '2024-01-15 00:00:00'),
  (@classic,'theo_page',
   'We''re starting Pride and Prejudice this month! Please read up to Chapter 20 by our next meeting on June 3rd. Can''t wait to hear your first impressions of Mr. Darcy.',
   '2026-05-15 00:00:00'),
  (@classic,'theo_page',
   'What a discussion we had on Crime and Punishment last month. Truly one of the greats. Poll for our next read is up — vote by end of week!',
   '2026-04-03 00:00:00'),
  (@classic,'theo_page',
   'Welcome to Classic Lit Society! Our goal is one great novel per month. Suggestions always welcome.',
   '2024-02-01 00:00:00');

-- =====================================================================
-- MEETINGS
-- =====================================================================
INSERT INTO meetings (club_id, title, location, meeting_datetime, created_at) VALUES
  (@fantasy,'Chapters 1–15 Discussion','Zoom','2026-06-10 20:00:00','2026-05-18 10:00:00'),
  (@fantasy,'Monthly Check-in','Zoom','2026-07-05 19:00:00','2026-05-18 10:01:00'),
  (@classic,'Pride & Prejudice — Chapters 1–20','Mileva bar','2026-06-03 19:30:00','2026-05-15 08:30:00');

-- =====================================================================
-- POLLS + POLL BOOKS (no votes in the seed)
-- =====================================================================
INSERT INTO polls (club_id, created_by, created_at) VALUES (@fantasy,'vanessa_reads','2026-05-10 12:00:00');
SET @poll1 = LAST_INSERT_ID();
INSERT INTO poll_books (poll_id, title, author, cover, description, ol_key) VALUES
  (@poll1,'A Court of Thorns and Roses','Sarah J. Maas',
   'https://covers.openlibrary.org/b/id/8738585-L.jpg',
   'A young huntress is dragged into the treacherous world of the Fae after killing a wolf in the woods. A sweeping fantasy romance with danger at every turn.',
   '/works/OL17913834W'),
  (@poll1,'The Priory of the Orange Tree','Samantha Shannon',
   'https://covers.openlibrary.org/b/id/8802446-L.jpg',
   'A world divided by ancient dragonfire. A sweeping, feminist high-fantasy epic about power, sacrifice, and the women who hold the world together.',
   '/works/OL20449227W'),
  (@poll1,'The Lies of Locke Lamora','Scott Lynch',
   'https://covers.openlibrary.org/b/id/6307636-L.jpg',
   'A gang of brilliant con artists steals from Camorr''s corrupt nobility — until a mysterious crime lord threatens to destroy everything. Clever, dark, and wickedly entertaining.',
   '/works/OL8149434W');

INSERT INTO polls (club_id, created_by, created_at) VALUES (@classic,'theo_page','2026-05-15 08:00:00');
SET @poll2 = LAST_INSERT_ID();
INSERT INTO poll_books (poll_id, title, author, cover, description, ol_key) VALUES
  (@poll2,'Jane Eyre','Charlotte Brontë',
   'https://covers.openlibrary.org/b/id/8235363-L.jpg',
   'An orphaned girl grows up to become a governess and falls in love with the brooding Mr. Rochester — only to discover a dark secret hidden in his manor.',
   '/works/OL1097843W'),
  (@poll2,'Great Expectations','Charles Dickens',
   'https://covers.openlibrary.org/b/id/13322313-L.jpg',
   'Young Pip''s journey from humble origins to London high society, guided by the mysterious hand of an unknown benefactor.',
   '/works/OL14866963W');

-- =====================================================================
-- BOOKS READ + RATINGS
-- Each book inserted singly so LAST_INSERT_ID() gives its id for ratings.
-- =====================================================================

-- ---- Fantasy Lovers ----
INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'The Eye of the World','Robert Jordan','https://covers.openlibrary.org/b/id/980232-L.jpg',
   'Five young villagers are forced to flee their home when a dark power sends terrifying creatures hunting for one of them. The beginning of an epic fourteen-book series.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',4),(@br,'luna_m',5),(@br,'river_wolf',4),(@br,'maya_reads',5);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'Assassin''s Apprentice','Robin Hobb','https://covers.openlibrary.org/b/id/4915230-L.jpg',
   'The illegitimate son of a prince is apprenticed to the royal assassin and trained in the Skill — a magical ability to influence minds — while navigating a treacherous court.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',5),(@br,'theo_page',4),(@br,'luna_m',5),(@br,'petra_b',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'The Blade Itself','Joe Abercrombie','https://covers.openlibrary.org/b/id/14543422-L.jpg',
   'A cynical barbarian, a crippled torturer, and a noble-born officer are drawn together as war threatens the Union. Gritty, darkly funny, and brutally subversive fantasy.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',4),(@br,'river_wolf',5),(@br,'maya_reads',4),(@br,'petra_b',3);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'A Wizard of Earthsea','Ursula K. Le Guin','https://covers.openlibrary.org/b/id/13617691-L.jpg',
   'A young boy with extraordinary magical talent enters a school of wizardry — and accidentally unleashes a nameless shadow that hunts him across the archipelago of Earthsea.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',5),(@br,'theo_page',5),(@br,'luna_m',4),(@br,'maya_reads',5);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'The Final Empire','Brandon Sanderson','https://covers.openlibrary.org/b/id/14658160-L.jpg',
   'In a world of ash and mist, where the Dark Lord won a thousand years ago, a ragtag crew of thieves plots to overthrow an immortal emperor using a rare magic fuelled by metals.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',5),(@br,'river_wolf',5),(@br,'maya_reads',5),(@br,'petra_b',5);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'The Fellowship of the Ring','J.R.R. Tolkien','https://covers.openlibrary.org/b/id/14627060-L.jpg',
   'A young hobbit inherits a ring of terrible power and sets out on a perilous journey to destroy it — accompanied by a fellowship of men, elves, dwarves, and wizards.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',5),(@br,'theo_page',5),(@br,'luna_m',5),(@br,'river_wolf',5),(@br,'maya_reads',4),(@br,'petra_b',5);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'The Hobbit','J.R.R. Tolkien','https://covers.openlibrary.org/b/id/14627509-L.jpg',
   'Bilbo Baggins is swept into an epic quest to reclaim the Lonely Mountain — and the dragon''s treasure within — alongside thirteen dwarves and a wizard.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',5),(@br,'theo_page',4),(@br,'luna_m',5),(@br,'river_wolf',5),(@br,'maya_reads',5),(@br,'petra_b',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'The Name of the Wind','Patrick Rothfuss','https://covers.openlibrary.org/b/id/11480483-L.jpg',
   'The legendary Kvothe narrates his own extraordinary life — from gifted child in a travelling troupe to mythical hero. A masterpiece of modern fantasy.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',4),(@br,'luna_m',4),(@br,'maya_reads',3),(@br,'petra_b',5);

-- ---- Classic Lit Society ----
INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@classic,'North and South','Elizabeth Gaskell','https://covers.openlibrary.org/b/id/8242253-L.jpg',
   'Margaret Hale moves from the gentle English south to a gritty industrial northern town, where she clashes — and slowly connects — with the proud mill-owner Mr. Thornton.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'theo_page',4),(@br,'sam_bookworm',4),(@br,'kai_stories',3);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@classic,'Middlemarch','George Eliot','https://covers.openlibrary.org/b/id/252882-L.jpg',
   'A panoramic portrait of life in a provincial English town, weaving together the idealistic Dorothea Brooke, the ambitious Dr. Lydgate, and a web of interconnected lives and loves.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'theo_page',5),(@br,'luna_m',4),(@br,'kai_stories',5);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@classic,'Crime and Punishment','Fyodor Dostoevsky','https://covers.openlibrary.org/b/id/13116014-L.jpg',
   'A destitute student murders a pawnbroker to test his theory that extraordinary men are above the law — and is consumed by guilt and psychological torment in the aftermath.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'theo_page',5),(@br,'sam_bookworm',4),(@br,'luna_m',5),(@br,'maya_reads',4),(@br,'kai_stories',5);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@classic,'Wuthering Heights','Emily Brontë','https://covers.openlibrary.org/b/id/12818862-L.jpg',
   'A brooding foundling and a spirited girl grow up together on the Yorkshire moors, bound by a fierce and destructive love that haunts two generations.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'theo_page',4),(@br,'sam_bookworm',3),(@br,'luna_m',5),(@br,'maya_reads',5),(@br,'kai_stories',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@classic,'Emma','Jane Austen','https://covers.openlibrary.org/b/id/9278312-L.jpg',
   'A clever and wealthy young woman fancies herself an expert matchmaker — with inevitably chaotic and comical results. Austen at her most playful and sharp.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'theo_page',4),(@br,'sam_bookworm',5),(@br,'luna_m',4),(@br,'maya_reads',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@classic,'Sense and Sensibility','Jane Austen','https://covers.openlibrary.org/b/id/9278292-L.jpg',
   'Two sisters — one ruled by sense, one by sensibility — navigate love, loss, and society in Regency England.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'theo_page',4),(@br,'sam_bookworm',5),(@br,'luna_m',4),(@br,'kai_stories',3);
