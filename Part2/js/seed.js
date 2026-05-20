(function () {
  if (JSON.parse(localStorage.getItem("bookies_users") || "[]").length > 0) return;

  var users = [
    {
      username: "vanessa_reads",
      nickname: "Vanessa",
      email: "vanessa@bookies.demo",
      password: "Bookworm1",
      securityQuestion1: "What is your favorite book?",
      securityQuestion2: "What is the first book you remember reading?",
      securityAnswer1: "The Way of Kings",
      securityAnswer2: "Harry Potter",
      clubs: ["Fantasy Lovers"],
      managedClub: "Fantasy Lovers",
      joinDate: "2024-01-15T10:00:00.000Z"
    },
    {
      username: "theo_page",
      nickname: "Theo",
      email: "theo@bookies.demo",
      password: "Bookworm1",
      securityQuestion1: "Which book have you re-read the most?",
      securityQuestion2: "Who is your favorite fictional character?",
      securityAnswer1: "Pride and Prejudice",
      securityAnswer2: "Atticus Finch",
      clubs: ["Fantasy Lovers", "Classic Lit Society"],
      managedClub: "Classic Lit Society",
      joinDate: "2024-02-01T09:00:00.000Z"
    },
    {
      username: "luna_m",
      nickname: "Luna",
      email: "luna@bookies.demo",
      password: "Bookworm1",
      securityQuestion1: "What was your childhood nickname?",
      securityQuestion2: "Which fictional place would you most like to live in?",
      securityAnswer1: "Lulu",
      securityAnswer2: "Rivendell",
      clubs: ["Fantasy Lovers", "Classic Lit Society"],
      managedClub: null,
      joinDate: "2024-03-10T14:00:00.000Z"
    },
    {
      username: "sam_bookworm",
      nickname: "Sam",
      email: "sam@bookies.demo",
      password: "Bookworm1",
      securityQuestion1: "What is your favorite book?",
      securityQuestion2: "Who is your favorite fictional character?",
      securityAnswer1: "To Kill a Mockingbird",
      securityAnswer2: "Elizabeth Bennet",
      clubs: ["Classic Lit Society"],
      managedClub: null,
      joinDate: "2024-04-05T11:00:00.000Z"
    },
    {
      username: "river_wolf",
      nickname: "River",
      email: "river@bookies.demo",
      password: "Bookworm1",
      securityQuestion1: "Which fictional place would you most like to live in?",
      securityQuestion2: "What is your favorite book?",
      securityAnswer1: "The Shire",
      securityAnswer2: "The Hobbit",
      clubs: ["Fantasy Lovers"],
      managedClub: null,
      joinDate: "2024-05-20T08:00:00.000Z"
    },
    {
      username: "maya_reads",
      nickname: "Maya",
      email: "maya@bookies.demo",
      password: "Bookworm1",
      securityQuestion1: "Who is your favorite fictional character?",
      securityQuestion2: "Which book have you re-read the most?",
      securityAnswer1: "Hermione Granger",
      securityAnswer2: "The Eye of the World",
      clubs: ["Fantasy Lovers", "Classic Lit Society"],
      managedClub: null,
      joinDate: "2024-06-01T12:00:00.000Z"
    },
    {
      username: "petra_b",
      nickname: "Petra",
      email: "petra@bookies.demo",
      password: "Bookworm1",
      securityQuestion1: "What is the first book you remember reading?",
      securityQuestion2: "What was your childhood nickname?",
      securityAnswer1: "The Neverending Story",
      securityAnswer2: "Pete",
      clubs: ["Fantasy Lovers"],
      managedClub: null,
      joinDate: "2024-07-14T15:30:00.000Z"
    },
    {
      username: "kai_stories",
      nickname: "Kai",
      email: "kai@bookies.demo",
      password: "Bookworm1",
      securityQuestion1: "Who is your favorite fictional character?",
      securityQuestion2: "What is your favorite book?",
      securityAnswer1: "Raskolnikov",
      securityAnswer2: "Crime and Punishment",
      clubs: ["Classic Lit Society"],
      managedClub: null,
      joinDate: "2024-08-09T10:00:00.000Z"
    }
  ];

  var clubs = [
    {
      clubTitle: "Fantasy Lovers",
      managerUsername: "vanessa_reads",
      description: "A cozy reading club for fantasy fans — dragons, magic, morally grey characters and emotional damage.",
      background: "videos/288559_tiny.mp4",
      members: ["vanessa_reads", "theo_page", "luna_m", "river_wolf", "maya_reads", "petra_b"],
      maxMembers: 15,
      announcements: [
        {
          text: "Hey everyone! Our next meeting is June 10th at 20:00. Come ready with thoughts on chapters 1–15 of The Way of Kings. Same Zoom link as always — see you there!",
          date: "May 18, 2026",
          from: "Vanessa"
        },
        {
          text: "The poll for our next read is live! We've got three great options this time — go vote before June 1st.",
          date: "May 10, 2026",
          from: "Vanessa"
        },
        {
          text: "Welcome to Fantasy Lovers! So excited to have you all here. Feel free to suggest books for our next poll.",
          date: "January 15, 2024",
          from: "Vanessa"
        }
      ],
      polls: [
        {
          id: "poll_demo_1",
          createdAt: "2026-05-10T12:00:00.000Z",
          createdBy: "vanessa_reads",
          books: [
            {
              title: "A Court of Thorns and Roses",
              author: "Sarah J. Maas",
              cover: "https://covers.openlibrary.org/b/id/8738585-L.jpg",
              description: "A young huntress is dragged into the treacherous world of the Fae after killing a wolf in the woods. A sweeping fantasy romance with danger at every turn.",
              key: "/works/OL17913834W",
              voteCount: 0,
              votedBy: []
            },
            {
              title: "The Priory of the Orange Tree",
              author: "Samantha Shannon",
              cover: "https://covers.openlibrary.org/b/id/8802446-L.jpg",
              description: "A world divided by ancient dragonfire. A sweeping, feminist high-fantasy epic about power, sacrifice, and the women who hold the world together.",
              key: "/works/OL20449227W",
              voteCount: 0,
              votedBy: []
            },
            {
              title: "The Lies of Locke Lamora",
              author: "Scott Lynch",
              cover: "https://covers.openlibrary.org/b/id/6307636-L.jpg",
              description: "A gang of brilliant con artists steals from Camorr's corrupt nobility — until a mysterious crime lord threatens to destroy everything. Clever, dark, and wickedly entertaining.",
              key: "/works/OL8149434W",
              voteCount: 0,
              votedBy: []
            }
          ]
        }
      ],
      meetings: [
        {
          title: "Chapters 1–15 Discussion",
          datetime: "2026-06-10T20:00",
          createdAt: "2026-05-18T10:00:00.000Z"
        },
        {
          title: "Monthly Check-in",
          datetime: "2026-07-05T19:00",
          createdAt: "2026-05-18T10:01:00.000Z"
        }
      ],
      currentBook: {
        title: "The Way of Kings",
        author: "Brandon Sanderson",
        cover: "https://covers.openlibrary.org/b/id/14658316-L.jpg",
        description: "Epic fantasy set in the storm-battered world of Roshar, following a surgeon-turned-soldier, a young woman searching for ancient knowledge, and a mysterious assassin. Book one of The Stormlight Archive."
      },
      booksRead: [
        {
          title: "The Eye of the World",
          author: "Robert Jordan",
          cover: "https://covers.openlibrary.org/b/id/980232-L.jpg",
          description: "Five young villagers are forced to flee their home when a dark power sends terrifying creatures hunting for one of them. The beginning of an epic fourteen-book series.",
          ratings: { vanessa_reads: 4, luna_m: 5, river_wolf: 4, maya_reads: 5 }
        },
        {
          title: "Assassin's Apprentice",
          author: "Robin Hobb",
          cover: "https://covers.openlibrary.org/b/id/4915230-L.jpg",
          description: "The illegitimate son of a prince is apprenticed to the royal assassin and trained in the Skill — a magical ability to influence minds — while navigating a treacherous court.",
          ratings: { vanessa_reads: 5, theo_page: 4, luna_m: 5, petra_b: 4 }
        },
        {
          title: "The Blade Itself",
          author: "Joe Abercrombie",
          cover: "https://covers.openlibrary.org/b/id/14543422-L.jpg",
          description: "A cynical barbarian, a crippled torturer, and a noble-born officer are drawn together as war threatens the Union. Gritty, darkly funny, and brutally subversive fantasy.",
          ratings: { vanessa_reads: 4, river_wolf: 5, maya_reads: 4, petra_b: 3 }
        },
        {
          title: "A Wizard of Earthsea",
          author: "Ursula K. Le Guin",
          cover: "https://covers.openlibrary.org/b/id/13617691-L.jpg",
          description: "A young boy with extraordinary magical talent enters a school of wizardry — and accidentally unleashes a nameless shadow that hunts him across the archipelago of Earthsea.",
          ratings: { vanessa_reads: 5, theo_page: 5, luna_m: 4, maya_reads: 5 }
        },
        {
          title: "The Final Empire",
          author: "Brandon Sanderson",
          cover: "https://covers.openlibrary.org/b/id/14658160-L.jpg",
          description: "In a world of ash and mist, where the Dark Lord won a thousand years ago, a ragtag crew of thieves plots to overthrow an immortal emperor using a rare magic fuelled by metals.",
          ratings: { vanessa_reads: 5, river_wolf: 5, maya_reads: 5, petra_b: 5 }
        },
        {
          title: "The Fellowship of the Ring",
          author: "J.R.R. Tolkien",
          cover: "https://covers.openlibrary.org/b/id/14627060-L.jpg",
          description: "A young hobbit inherits a ring of terrible power and sets out on a perilous journey to destroy it — accompanied by a fellowship of men, elves, dwarves, and wizards.",
          ratings: { vanessa_reads: 5, theo_page: 5, luna_m: 5, river_wolf: 5, maya_reads: 4, petra_b: 5 }
        },
        {
          title: "The Hobbit",
          author: "J.R.R. Tolkien",
          cover: "https://covers.openlibrary.org/b/id/14627509-L.jpg",
          description: "Bilbo Baggins is swept into an epic quest to reclaim the Lonely Mountain — and the dragon's treasure within — alongside thirteen dwarves and a wizard.",
          ratings: { vanessa_reads: 5, theo_page: 4, luna_m: 5, river_wolf: 5, maya_reads: 5, petra_b: 4 }
        },
        {
          title: "The Name of the Wind",
          author: "Patrick Rothfuss",
          cover: "https://covers.openlibrary.org/b/id/11480483-L.jpg",
          description: "The legendary Kvothe narrates his own extraordinary life — from gifted child in a travelling troupe to mythical hero. A masterpiece of modern fantasy.",
          ratings: { vanessa_reads: 4, luna_m: 4, maya_reads: 3, petra_b: 5 }
        }
      ],
      createdAt: "2024-01-15T10:30:00.000Z"
    },
    {
      clubTitle: "Classic Lit Society",
      managerUsername: "theo_page",
      description: "Rediscovering the timeless works of literature — from Austen to Dostoevsky. All readers welcome.",
      background: "videos/Fireplace_Background.mp4",
      members: ["theo_page", "sam_bookworm", "luna_m", "maya_reads", "kai_stories"],
      maxMembers: 10,
      announcements: [
        {
          text: "We're starting Pride and Prejudice this month! Please read up to Chapter 20 by our next meeting on June 3rd. Can't wait to hear your first impressions of Mr. Darcy.",
          date: "May 15, 2026",
          from: "Theo"
        },
        {
          text: "What a discussion we had on Crime and Punishment last month. Truly one of the greats. Poll for our next read is up — vote by end of week!",
          date: "April 3, 2026",
          from: "Theo"
        },
        {
          text: "Welcome to Classic Lit Society! Our goal is one great novel per month. Suggestions always welcome.",
          date: "February 1, 2024",
          from: "Theo"
        }
      ],
      polls: [
        {
          id: "poll_demo_2",
          createdAt: "2026-05-15T08:00:00.000Z",
          createdBy: "theo_page",
          books: [
            {
              title: "Jane Eyre",
              author: "Charlotte Brontë",
              cover: "https://covers.openlibrary.org/b/id/8235363-L.jpg",
              description: "An orphaned girl grows up to become a governess and falls in love with the brooding Mr. Rochester — only to discover a dark secret hidden in his manor.",
              key: "/works/OL1097843W",
              voteCount: 0,
              votedBy: []
            },
            {
              title: "Great Expectations",
              author: "Charles Dickens",
              cover: "https://covers.openlibrary.org/b/id/13322313-L.jpg",
              description: "Young Pip's journey from humble origins to London high society, guided by the mysterious hand of an unknown benefactor.",
              key: "/works/OL14866963W",
              voteCount: 0,
              votedBy: []
            }
          ]
        }
      ],
      meetings: [
        {
          title: "Pride & Prejudice — Chapters 1–20",
          datetime: "2026-06-03T19:30",
          createdAt: "2026-05-15T08:30:00.000Z"
        }
      ],
      currentBook: {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        cover: "https://covers.openlibrary.org/b/id/14348537-L.jpg",
        description: "Witty and romantic, this beloved novel follows Elizabeth Bennet as she navigates questions of manners, marriage, and morality in Georgian England — and gradually sees past her first impressions of Mr. Darcy."
      },
      booksRead: [
        {
          title: "North and South",
          author: "Elizabeth Gaskell",
          cover: "https://covers.openlibrary.org/b/id/8242253-L.jpg",
          description: "Margaret Hale moves from the gentle English south to a gritty industrial northern town, where she clashes — and slowly connects — with the proud mill-owner Mr. Thornton.",
          ratings: { theo_page: 4, sam_bookworm: 4, kai_stories: 3 }
        },
        {
          title: "Middlemarch",
          author: "George Eliot",
          cover: "https://covers.openlibrary.org/b/id/252882-L.jpg",
          description: "A panoramic portrait of life in a provincial English town, weaving together the idealistic Dorothea Brooke, the ambitious Dr. Lydgate, and a web of interconnected lives and loves.",
          ratings: { theo_page: 5, luna_m: 4, kai_stories: 5 }
        },
        {
          title: "Crime and Punishment",
          author: "Fyodor Dostoevsky",
          cover: "https://covers.openlibrary.org/b/id/13116014-L.jpg",
          description: "A destitute student murders a pawnbroker to test his theory that extraordinary men are above the law — and is consumed by guilt and psychological torment in the aftermath.",
          ratings: { theo_page: 5, sam_bookworm: 4, luna_m: 5, maya_reads: 4, kai_stories: 5 }
        },
        {
          title: "Wuthering Heights",
          author: "Emily Brontë",
          cover: "https://covers.openlibrary.org/b/id/12818862-L.jpg",
          description: "A brooding foundling and a spirited girl grow up together on the Yorkshire moors, bound by a fierce and destructive love that haunts two generations.",
          ratings: { theo_page: 4, sam_bookworm: 3, luna_m: 5, maya_reads: 5, kai_stories: 4 }
        },
        {
          title: "Emma",
          author: "Jane Austen",
          cover: "https://covers.openlibrary.org/b/id/9278312-L.jpg",
          description: "A clever and wealthy young woman fancies herself an expert matchmaker — with inevitably chaotic and comical results. Austen at her most playful and sharp.",
          ratings: { theo_page: 4, sam_bookworm: 5, luna_m: 4, maya_reads: 4 }
        },
        {
          title: "Sense and Sensibility",
          author: "Jane Austen",
          cover: "https://covers.openlibrary.org/b/id/9278292-L.jpg",
          description: "Two sisters — one ruled by sense, one by sensibility — navigate love, loss, and society in Regency England.",
          ratings: { theo_page: 4, sam_bookworm: 5, luna_m: 4, kai_stories: 3 }
        }
      ],
      createdAt: "2024-02-01T09:30:00.000Z"
    }
  ];

  localStorage.setItem("bookies_users", JSON.stringify(users));
  localStorage.setItem("bookies_clubs", JSON.stringify(clubs));
})();
