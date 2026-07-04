-- Bookies demo data, translated faithfully from public/js/seed.js and expanded
-- with additional users, clubs, members and read-book history.
-- Run AFTER schema.sql. Load with utf8mb4 so en/em dashes and accented names
-- (Brontë, etc.) survive:  mysql -u root -p --default-character-set=utf8mb4 bookies < database/seed.sql
USE bookies;

-- =====================================================================
-- USERS (20) — all keep the demo password "Bookworm1"
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
   'What is your favorite book?','Crime and Punishment','2024-08-09 10:00:00'),
  ('oscar_novel','Oscar','oscar@bookies.demo','Bookworm1',
   'What is your favorite book?','Dune',
   'Which fictional place would you most like to live in?','Arrakis','2024-09-02 09:15:00'),
  ('nadia_reads','Nadia','nadia@bookies.demo','Bookworm1',
   'Who is your favorite fictional character?','Lisbeth Salander',
   'What was your childhood nickname?','Nads','2024-09-18 13:45:00'),
  ('ben_turner','Ben','ben@bookies.demo','Bookworm1',
   'Which book have you re-read the most?','Normal People',
   'What is the first book you remember reading?','Matilda','2024-10-01 08:30:00'),
  ('clara_ink','Clara','clara@bookies.demo','Bookworm1',
   'What is your favorite book?','Jane Eyre',
   'Who is your favorite fictional character?','Jo March','2024-10-22 16:00:00'),
  ('dev_patel','Dev','dev@bookies.demo','Bookworm1',
   'Which fictional place would you most like to live in?','Hogwarts',
   'What is your favorite book?','The Name of the Wind','2024-11-05 11:20:00'),
  ('elena_ro','Elena','elena@bookies.demo','Bookworm1',
   'What was your childhood nickname?','Lena',
   'Which book have you re-read the most?','Middlemarch','2024-11-19 10:10:00'),
  ('finn_gray','Finn','finn@bookies.demo','Bookworm1',
   'What is your favorite book?','Neuromancer',
   'Who is your favorite fictional character?','Paul Atreides','2024-12-03 14:40:00'),
  ('grace_lee','Grace','grace@bookies.demo','Bookworm1',
   'What is the first book you remember reading?','Charlotte''s Web',
   'What was your childhood nickname?','Gigi','2024-12-15 09:50:00'),
  ('hugo_m','Hugo','hugo@bookies.demo','Bookworm1',
   'Who is your favorite fictional character?','Sam Vimes',
   'What is your favorite book?','Good Omens','2025-01-08 12:25:00'),
  ('iris_woods','Iris','iris@bookies.demo','Bookworm1',
   'Which fictional place would you most like to live in?','Narnia',
   'Which book have you re-read the most?','Rebecca','2025-01-27 15:05:00'),
  ('jonah_k','Jonah','jonah@bookies.demo','Bookworm1',
   'What is your favorite book?','Klara and the Sun',
   'What was your childhood nickname?','Jo','2025-02-11 10:35:00'),
  ('priya_s','Priya','priya@bookies.demo','Bookworm1',
   'Who is your favorite fictional character?','Cordelia Naismith',
   'What is the first book you remember reading?','The Secret Garden','2025-02-28 13:15:00');

-- =====================================================================
-- CLUBS (5) — capture each generated id in a user variable
-- manager_username is UNIQUE, so every club has a distinct manager.
-- =====================================================================
INSERT INTO clubs (title, manager_username, description, background, max_members, created_at) VALUES
  ('Fantasy Lovers','vanessa_reads',
   'A cozy reading club for fantasy fans — dragons, magic, morally grey characters and emotional damage.',
   'videos/288559_tiny.mp4', 15, '2024-01-15 10:30:00');
SET @fantasy = LAST_INSERT_ID();

INSERT INTO clubs (title, manager_username, description, background, max_members, created_at) VALUES
  ('Classic Lit Society','theo_page',
   'Rediscovering the timeless works of literature — from Austen to Dostoevsky. All readers welcome.',
   'videos/Fireplace_Background.mp4', 12, '2024-02-01 09:30:00');
SET @classic = LAST_INSERT_ID();

INSERT INTO clubs (title, manager_username, description, background, max_members, created_at) VALUES
  ('Sci-Fi Explorers','oscar_novel',
   'Boldly reading where no book club has read before — space opera, cyberpunk, hard SF and everything in between.',
   'videos/288559_tiny.mp4', 15, '2024-09-05 18:00:00');
SET @scifi = LAST_INSERT_ID();

INSERT INTO clubs (title, manager_username, description, background, max_members, created_at) VALUES
  ('Mystery & Thrillers','nadia_reads',
   'Whodunnits, slow-burn thrillers and locked-room puzzles. Bring your theories — and don''t trust the narrator.',
   'videos/Fireplace_Background.mp4', 12, '2024-09-20 20:15:00');
SET @mystery = LAST_INSERT_ID();

INSERT INTO clubs (title, manager_username, description, background, max_members, created_at) VALUES
  ('Contemporary Fiction','ben_turner',
   'Modern literary fiction and the conversations it starts — messy characters, big feelings, sharp prose.',
   'videos/288559_tiny.mp4', 12, '2024-10-04 19:00:00');
SET @contemp = LAST_INSERT_ID();

-- =====================================================================
-- CLUB MEMBERS (manager included, as in the seed)
-- =====================================================================
INSERT INTO club_members (club_id, username) VALUES
  (@fantasy,'vanessa_reads'),(@fantasy,'theo_page'),(@fantasy,'luna_m'),
  (@fantasy,'river_wolf'),(@fantasy,'maya_reads'),(@fantasy,'petra_b'),
  (@fantasy,'dev_patel'),(@fantasy,'finn_gray'),(@fantasy,'grace_lee'),(@fantasy,'hugo_m'),
  (@classic,'theo_page'),(@classic,'sam_bookworm'),(@classic,'luna_m'),
  (@classic,'maya_reads'),(@classic,'kai_stories'),(@classic,'clara_ink'),(@classic,'elena_ro'),
  (@scifi,'oscar_novel'),(@scifi,'dev_patel'),(@scifi,'finn_gray'),(@scifi,'jonah_k'),
  (@scifi,'priya_s'),(@scifi,'river_wolf'),(@scifi,'maya_reads'),
  (@mystery,'nadia_reads'),(@mystery,'iris_woods'),(@mystery,'grace_lee'),(@mystery,'hugo_m'),
  (@mystery,'sam_bookworm'),(@mystery,'kai_stories'),(@mystery,'priya_s'),
  (@contemp,'ben_turner'),(@contemp,'clara_ink'),(@contemp,'elena_ro'),(@contemp,'iris_woods'),
  (@contemp,'jonah_k'),(@contemp,'luna_m'),(@contemp,'nadia_reads');

-- =====================================================================
-- CURRENT BOOKS (1 per club)
-- =====================================================================
INSERT INTO current_books (club_id, title, author, cover, description) VALUES
  (@fantasy,'The Way of Kings','Brandon Sanderson',
   'https://covers.openlibrary.org/b/id/14658316-L.jpg',
   'Epic fantasy set in the storm-battered world of Roshar, following a surgeon-turned-soldier, a young woman searching for ancient knowledge, and a mysterious assassin. Book one of The Stormlight Archive.'),
  (@classic,'Pride and Prejudice','Jane Austen',
   'https://covers.openlibrary.org/b/id/14348537-L.jpg',
   'Witty and romantic, this beloved novel follows Elizabeth Bennet as she navigates questions of manners, marriage, and morality in Georgian England — and gradually sees past her first impressions of Mr. Darcy.'),
  (@scifi,'Dune','Frank Herbert',
   'https://covers.openlibrary.org/b/id/11481354-L.jpg',
   'On the desert planet Arrakis, the only source of the universe''s most precious substance, a young heir must navigate betrayal, prophecy and interstellar politics to claim his destiny.'),
  (@mystery,'The Girl with the Dragon Tattoo','Stieg Larsson',
   'https://covers.openlibrary.org/b/id/8231990-L.jpg',
   'A disgraced journalist and a brilliant, troubled hacker investigate a woman''s disappearance forty years cold — and uncover a family''s darkest secrets.'),
  (@contemp,'Normal People','Sally Rooney',
   'https://covers.openlibrary.org/b/id/9319698-L.jpg',
   'Connell and Marianne circle each other through school and university in Ireland, their intimacy and miscommunication tracing the shape of first love and class difference.');

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
   '2024-02-01 00:00:00'),
  (@scifi,'oscar_novel',
   'Dune is our July pick! Read Book One (up to "Muad''Dib") before we meet on July 12th. Spice must flow, and so must the discussion.',
   '2026-06-20 00:00:00'),
  (@scifi,'oscar_novel',
   'New poll is up for our August read — three modern classics to choose from. Get your votes in by the end of the month!',
   '2026-06-08 00:00:00'),
  (@scifi,'oscar_novel',
   'Welcome aboard, Explorers! We alternate between space opera and hard SF each month. Bring your wildest theories.',
   '2024-09-05 00:00:00'),
  (@mystery,'nadia_reads',
   'Dragon Tattoo discussion is set for July 8th — try to finish Part 3 beforehand. No spoilers in the chat, please!',
   '2026-06-22 00:00:00'),
  (@mystery,'nadia_reads',
   'Loved unraveling Gone Girl together last month — that midpoint twist got everyone. Next poll is live, go vote!',
   '2026-05-30 00:00:00'),
  (@mystery,'nadia_reads',
   'Welcome to Mystery & Thrillers! Rule one: theories encouraged. Rule two: never trust the narrator.',
   '2024-09-20 00:00:00'),
  (@contemp,'ben_turner',
   'We''re reading Normal People this month. Let''s meet July 15th to talk Connell, Marianne, and everything left unsaid.',
   '2026-06-25 00:00:00'),
  (@contemp,'ben_turner',
   'Thanks for the raw, honest chat about A Little Life — take care of yourselves this week. New poll coming soon.',
   '2026-06-02 00:00:00'),
  (@contemp,'ben_turner',
   'Welcome to Contemporary Fiction! Expect messy characters, big feelings, and even bigger conversations.',
   '2024-10-04 00:00:00');

-- =====================================================================
-- MEETINGS
-- =====================================================================
INSERT INTO meetings (club_id, title, location, meeting_datetime, created_at) VALUES
  (@fantasy,'Chapters 1–15 Discussion','Zoom','2026-06-10 20:00:00','2026-05-18 10:00:00'),
  (@fantasy,'Monthly Check-in','Zoom','2026-07-05 19:00:00','2026-05-18 10:01:00'),
  (@classic,'Pride & Prejudice — Chapters 1–20','Mileva bar','2026-06-03 19:30:00','2026-05-15 08:30:00'),
  (@scifi,'Dune — Book One Discussion','Discord','2026-07-12 20:00:00','2026-06-20 09:00:00'),
  (@scifi,'Hard SF Night','Discord','2026-08-09 20:00:00','2026-06-20 09:05:00'),
  (@mystery,'Dragon Tattoo — Parts 1–3','Zoom','2026-07-08 19:30:00','2026-06-22 11:00:00'),
  (@contemp,'Normal People — Full Discussion','The Reading Room Café','2026-07-15 18:30:00','2026-06-25 12:00:00');

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

INSERT INTO polls (club_id, created_by, created_at) VALUES (@scifi,'oscar_novel','2026-06-08 10:00:00');
SET @poll3 = LAST_INSERT_ID();
INSERT INTO poll_books (poll_id, title, author, cover, description, ol_key) VALUES
  (@poll3,'Children of Time','Adrian Tchaikovsky',
   'https://covers.openlibrary.org/b/id/8508859-L.jpg',
   'The last remnants of humanity flee a dying Earth toward a terraformed world — one that has been inherited by a very different, and rapidly evolving, form of life.',
   '/works/OL17332173W'),
  (@poll3,'Ancillary Justice','Ann Leckie',
   'https://covers.openlibrary.org/b/id/7326097-L.jpg',
   'Once the AI of a vast starship inhabiting thousands of bodies, now trapped in a single human form, Breq hunts for revenge across a galaxy-spanning empire.',
   '/works/OL16813953W'),
  (@poll3,'Project Hail Mary','Andy Weir',
   'https://covers.openlibrary.org/b/id/12609231-L.jpg',
   'A lone astronaut wakes with no memory aboard a ship on a desperate mission to save humanity — and makes an unexpected friend along the way.',
   '/works/OL24202956W');

INSERT INTO polls (club_id, created_by, created_at) VALUES (@mystery,'nadia_reads','2026-05-30 09:00:00');
SET @poll4 = LAST_INSERT_ID();
INSERT INTO poll_books (poll_id, title, author, cover, description, ol_key) VALUES
  (@poll4,'The Silent Patient','Alex Michaelides',
   'https://covers.openlibrary.org/b/id/9251996-L.jpg',
   'A famous painter shoots her husband and then never speaks again. A criminal psychotherapist becomes obsessed with uncovering why.',
   '/works/OL19351042W'),
  (@poll4,'Sharp Objects','Gillian Flynn',
   'https://covers.openlibrary.org/b/id/8767797-L.jpg',
   'A reporter returns to her small hometown to cover the murders of two girls — and is forced to confront her own dark family history.',
   '/works/OL5735386W'),
  (@poll4,'The Thursday Murder Club','Richard Osman',
   'https://covers.openlibrary.org/b/id/10523301-L.jpg',
   'Four retirees in a peaceful village meet weekly to investigate cold cases — until a real murder lands on their doorstep.',
   '/works/OL21395601W');

INSERT INTO polls (club_id, created_by, created_at) VALUES (@contemp,'ben_turner','2026-06-02 11:00:00');
SET @poll5 = LAST_INSERT_ID();
INSERT INTO poll_books (poll_id, title, author, cover, description, ol_key) VALUES
  (@poll5,'Circe','Madeline Miller',
   'https://covers.openlibrary.org/b/id/8288858-L.jpg',
   'The banished witch-goddess of Aiaia tells her own story — of gods, monsters, mortals, and the slow forging of her own power.',
   '/works/OL17608348W'),
  (@poll5,'Pachinko','Min Jin Lee',
   'https://covers.openlibrary.org/b/id/8451547-L.jpg',
   'Four generations of a Korean family make their way in twentieth-century Japan, enduring displacement, prejudice, and quiet resilience.',
   '/works/OL17356582W'),
  (@poll5,'The Midnight Library','Matt Haig',
   'https://covers.openlibrary.org/b/id/10389354-L.jpg',
   'Between life and death lies a library where every book is a life you could have lived. Nora Seed gets the chance to try them all.',
   '/works/OL20510384W');

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
  (@br,'vanessa_reads',4),(@br,'luna_m',5),(@br,'river_wolf',4),(@br,'maya_reads',5),(@br,'dev_patel',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'Assassin''s Apprentice','Robin Hobb','https://covers.openlibrary.org/b/id/4915230-L.jpg',
   'The illegitimate son of a prince is apprenticed to the royal assassin and trained in the Skill — a magical ability to influence minds — while navigating a treacherous court.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',5),(@br,'theo_page',4),(@br,'luna_m',5),(@br,'petra_b',4),(@br,'finn_gray',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'The Blade Itself','Joe Abercrombie','https://covers.openlibrary.org/b/id/14543422-L.jpg',
   'A cynical barbarian, a crippled torturer, and a noble-born officer are drawn together as war threatens the Union. Gritty, darkly funny, and brutally subversive fantasy.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',4),(@br,'river_wolf',5),(@br,'maya_reads',4),(@br,'petra_b',3),(@br,'hugo_m',5);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'A Wizard of Earthsea','Ursula K. Le Guin','https://covers.openlibrary.org/b/id/13617691-L.jpg',
   'A young boy with extraordinary magical talent enters a school of wizardry — and accidentally unleashes a nameless shadow that hunts him across the archipelago of Earthsea.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',5),(@br,'theo_page',5),(@br,'luna_m',4),(@br,'maya_reads',5),(@br,'grace_lee',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'The Final Empire','Brandon Sanderson','https://covers.openlibrary.org/b/id/14658160-L.jpg',
   'In a world of ash and mist, where the Dark Lord won a thousand years ago, a ragtag crew of thieves plots to overthrow an immortal emperor using a rare magic fuelled by metals.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',5),(@br,'river_wolf',5),(@br,'maya_reads',5),(@br,'petra_b',5),(@br,'dev_patel',5);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'The Fellowship of the Ring','J.R.R. Tolkien','https://covers.openlibrary.org/b/id/14627060-L.jpg',
   'A young hobbit inherits a ring of terrible power and sets out on a perilous journey to destroy it — accompanied by a fellowship of men, elves, dwarves, and wizards.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',5),(@br,'theo_page',5),(@br,'luna_m',5),(@br,'river_wolf',5),(@br,'maya_reads',4),(@br,'petra_b',5),(@br,'hugo_m',5);

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
  (@br,'vanessa_reads',4),(@br,'luna_m',4),(@br,'maya_reads',3),(@br,'petra_b',5),(@br,'dev_patel',5),(@br,'finn_gray',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'The Fifth Season','N.K. Jemisin','https://covers.openlibrary.org/b/id/8299845-L.jpg',
   'In a world wracked by apocalyptic seasons, a woman searches for her kidnapped daughter across a dying continent — in a novel that reinvents what epic fantasy can be.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',5),(@br,'luna_m',5),(@br,'maya_reads',5),(@br,'grace_lee',4),(@br,'hugo_m',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@fantasy,'The Poppy War','R.F. Kuang','https://covers.openlibrary.org/b/id/8934145-L.jpg',
   'A war orphan aces the empire''s hardest exam and enters an elite military academy — where she discovers a lethal, addictive power and the looming shadow of genocide.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'vanessa_reads',4),(@br,'river_wolf',4),(@br,'petra_b',5),(@br,'dev_patel',4),(@br,'finn_gray',5);

-- ---- Classic Lit Society ----
INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@classic,'North and South','Elizabeth Gaskell','https://covers.openlibrary.org/b/id/8242253-L.jpg',
   'Margaret Hale moves from the gentle English south to a gritty industrial northern town, where she clashes — and slowly connects — with the proud mill-owner Mr. Thornton.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'theo_page',4),(@br,'sam_bookworm',4),(@br,'kai_stories',3),(@br,'clara_ink',5);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@classic,'Middlemarch','George Eliot','https://covers.openlibrary.org/b/id/252882-L.jpg',
   'A panoramic portrait of life in a provincial English town, weaving together the idealistic Dorothea Brooke, the ambitious Dr. Lydgate, and a web of interconnected lives and loves.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'theo_page',5),(@br,'luna_m',4),(@br,'kai_stories',5),(@br,'elena_ro',5);

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
  (@br,'theo_page',4),(@br,'sam_bookworm',3),(@br,'luna_m',5),(@br,'maya_reads',5),(@br,'kai_stories',4),(@br,'clara_ink',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@classic,'Emma','Jane Austen','https://covers.openlibrary.org/b/id/9278312-L.jpg',
   'A clever and wealthy young woman fancies herself an expert matchmaker — with inevitably chaotic and comical results. Austen at her most playful and sharp.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'theo_page',4),(@br,'sam_bookworm',5),(@br,'luna_m',4),(@br,'maya_reads',4),(@br,'clara_ink',5);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@classic,'Sense and Sensibility','Jane Austen','https://covers.openlibrary.org/b/id/9278292-L.jpg',
   'Two sisters — one ruled by sense, one by sensibility — navigate love, loss, and society in Regency England.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'theo_page',4),(@br,'sam_bookworm',5),(@br,'luna_m',4),(@br,'kai_stories',3),(@br,'elena_ro',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@classic,'The Great Gatsby','F. Scott Fitzgerald','https://covers.openlibrary.org/b/id/12002027-L.jpg',
   'On Long Island in the roaring twenties, the mysterious millionaire Jay Gatsby throws lavish parties in pursuit of a lost love — and the hollow heart of the American Dream.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'theo_page',5),(@br,'sam_bookworm',4),(@br,'kai_stories',4),(@br,'elena_ro',5),(@br,'clara_ink',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@classic,'Anna Karenina','Leo Tolstoy','https://covers.openlibrary.org/b/id/8091016-L.jpg',
   'A married aristocrat''s passionate affair with a dashing officer unravels her life, set against the sweeping social canvas of Imperial Russia.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'theo_page',5),(@br,'luna_m',4),(@br,'maya_reads',4),(@br,'kai_stories',5),(@br,'elena_ro',5);

-- ---- Sci-Fi Explorers ----
INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@scifi,'The Left Hand of Darkness','Ursula K. Le Guin','https://covers.openlibrary.org/b/id/8291886-L.jpg',
   'An envoy from a galactic coalition arrives on a frozen world whose inhabitants have no fixed gender — and must cross both ice and cultural chasm to complete his mission.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'oscar_novel',5),(@br,'finn_gray',4),(@br,'priya_s',5),(@br,'maya_reads',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@scifi,'Neuromancer','William Gibson','https://covers.openlibrary.org/b/id/9255566-L.jpg',
   'A washed-up computer hacker is hired for one last job that plunges him into a neon underworld of AIs, cyberspace, and corporate intrigue. The founding text of cyberpunk.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'oscar_novel',4),(@br,'finn_gray',5),(@br,'dev_patel',4),(@br,'river_wolf',3);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@scifi,'Foundation','Isaac Asimov','https://covers.openlibrary.org/b/id/12758099-L.jpg',
   'As a galactic empire crumbles, a mathematician foresees a thirty-thousand-year dark age — and founds a secret colony to preserve civilization and shorten the fall.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'oscar_novel',5),(@br,'jonah_k',4),(@br,'priya_s',4),(@br,'dev_patel',5);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@scifi,'The Three-Body Problem','Cixin Liu','https://covers.openlibrary.org/b/id/8642405-L.jpg',
   'A secret military project makes contact with an alien civilization on the brink of destruction — which now sets its sights on Earth. Hard SF on a cosmic scale.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'oscar_novel',5),(@br,'finn_gray',5),(@br,'jonah_k',4),(@br,'maya_reads',3),(@br,'river_wolf',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@scifi,'Hyperion','Dan Simmons','https://covers.openlibrary.org/b/id/8306735-L.jpg',
   'Seven pilgrims journey to the distant world of Hyperion and the lair of the Shrike, each telling their story along the way. A dazzling, Canterbury-Tales-in-space epic.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'oscar_novel',5),(@br,'priya_s',5),(@br,'dev_patel',4),(@br,'finn_gray',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@scifi,'Snow Crash','Neal Stephenson','https://covers.openlibrary.org/b/id/8231216-L.jpg',
   'A pizza-delivering hacker-samurai and a teenage skateboard courier race through a fractured near-future America to stop a mind-altering virus loose in the Metaverse.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'oscar_novel',4),(@br,'finn_gray',4),(@br,'jonah_k',5),(@br,'river_wolf',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@scifi,'A Wrinkle in Time','Madeleine L''Engle','https://covers.openlibrary.org/b/id/8280451-L.jpg',
   'A young girl, her brilliant little brother, and a friend travel through space and time via a "tesseract" to rescue her missing scientist father from a cosmic darkness.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'oscar_novel',4),(@br,'priya_s',5),(@br,'maya_reads',4),(@br,'jonah_k',4);

-- ---- Mystery & Thrillers ----
INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@mystery,'Gone Girl','Gillian Flynn','https://covers.openlibrary.org/b/id/8231856-L.jpg',
   'When a woman vanishes on her fifth wedding anniversary, suspicion falls on her husband — but nothing about their marriage is what it seems. A razor-sharp psychological thriller.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'nadia_reads',5),(@br,'iris_woods',5),(@br,'grace_lee',4),(@br,'sam_bookworm',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@mystery,'And Then There Were None','Agatha Christie','https://covers.openlibrary.org/b/id/8577032-L.jpg',
   'Ten strangers are lured to a remote island and killed off one by one, each death echoing a sinister nursery rhyme. Christie''s masterpiece of the locked-room puzzle.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'nadia_reads',5),(@br,'hugo_m',5),(@br,'kai_stories',4),(@br,'priya_s',5),(@br,'iris_woods',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@mystery,'The Big Sleep','Raymond Chandler','https://covers.openlibrary.org/b/id/8231441-L.jpg',
   'Private eye Philip Marlowe is hired by a dying millionaire and pulled into a tangle of blackmail, murder, and Los Angeles corruption. Hardboiled noir at its finest.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'nadia_reads',4),(@br,'grace_lee',3),(@br,'hugo_m',5),(@br,'sam_bookworm',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@mystery,'In the Woods','Tana French','https://covers.openlibrary.org/b/id/8739161-L.jpg',
   'A detective investigating the murder of a young girl in an Irish town realizes the case is entwined with a childhood trauma he can''t remember. Atmospheric literary crime.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'nadia_reads',4),(@br,'iris_woods',5),(@br,'kai_stories',4),(@br,'priya_s',3);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@mystery,'The Hound of the Baskervilles','Arthur Conan Doyle','https://covers.openlibrary.org/b/id/12717978-L.jpg',
   'Sherlock Holmes and Dr. Watson investigate a legendary demonic hound said to stalk the Devonshire moors and haunt the ancient Baskerville family.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'nadia_reads',5),(@br,'hugo_m',4),(@br,'grace_lee',4),(@br,'sam_bookworm',5),(@br,'kai_stories',5);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@mystery,'Rebecca','Daphne du Maurier','https://covers.openlibrary.org/b/id/8231889-L.jpg',
   'A shy young bride arrives at her husband''s grand estate to find it haunted by the memory of his glamorous first wife — and the sinister housekeeper who worshipped her.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'nadia_reads',5),(@br,'iris_woods',5),(@br,'grace_lee',5),(@br,'priya_s',4);

-- ---- Contemporary Fiction ----
INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@contemp,'A Little Life','Hanya Yanagihara','https://covers.openlibrary.org/b/id/8318060-L.jpg',
   'Four college friends build lives in New York, but the story centers on the brilliant, damaged Jude and the trauma he carries. A shattering novel about friendship and endurance.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'ben_turner',5),(@br,'clara_ink',5),(@br,'iris_woods',4),(@br,'luna_m',5);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@contemp,'The Goldfinch','Donna Tartt','https://covers.openlibrary.org/b/id/7278082-L.jpg',
   'A boy who survives the explosion that kills his mother clings to a small, stolen Dutch painting — a thread that pulls him through grief, crime, and obsession into adulthood.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'ben_turner',4),(@br,'elena_ro',5),(@br,'jonah_k',4),(@br,'nadia_reads',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@contemp,'Where the Crawdads Sing','Delia Owens','https://covers.openlibrary.org/b/id/9282183-L.jpg',
   'Abandoned as a girl, "Marsh Girl" Kya raises herself in the North Carolina wetlands — until she becomes the prime suspect in the death of a local golden boy.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'ben_turner',4),(@br,'clara_ink',4),(@br,'iris_woods',5),(@br,'elena_ro',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@contemp,'Little Fires Everywhere','Celeste Ng','https://covers.openlibrary.org/b/id/8536616-L.jpg',
   'In an orderly Ohio suburb, the arrival of an enigmatic artist and her daughter upends the picture-perfect Richardson family — and exposes the fault lines beneath.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'ben_turner',4),(@br,'luna_m',4),(@br,'jonah_k',5),(@br,'nadia_reads',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@contemp,'Klara and the Sun','Kazuo Ishiguro','https://covers.openlibrary.org/b/id/10574326-L.jpg',
   'Klara, an artificial friend with keen observational gifts, watches the world from a store window and hopes to be chosen — in a tender meditation on love and what it means to be human.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'ben_turner',5),(@br,'jonah_k',5),(@br,'clara_ink',4),(@br,'elena_ro',4),(@br,'iris_woods',4);

INSERT INTO books_read (club_id, title, author, cover, description) VALUES
  (@contemp,'The Song of Achilles','Madeline Miller','https://covers.openlibrary.org/b/id/8288799-L.jpg',
   'The Trojan War retold through the tender, doomed love between Achilles and Patroclus — a lyrical reimagining of Homer that aches from first page to last.');
SET @br = LAST_INSERT_ID();
INSERT INTO book_ratings (book_read_id, username, rating) VALUES
  (@br,'ben_turner',5),(@br,'clara_ink',5),(@br,'luna_m',5),(@br,'elena_ro',5),(@br,'iris_woods',4);
</content>
</invoke>
