// liga/liga-data.js

window.LIGA_SEASONS = [
  // ===========================
  // SEASON 1 (data yang sekarang)
  // ===========================
  {
    seasonId: "2025-S1",
    label: "Season 1 — Oct–Dec 2025",
    plannedWeeks: 12, // target minggu season ini

    members: [
      {
        id: "michelle",
        name: "Michelle Alexandra",
        avatar: "../img/liga/profile-michelle.jpg",
        gen: "Generasi 11",
        hashtag: "#KaMich"
      },
      {
        id: "katherine",
        name: "Katherine Irenne",
        avatar: "../img/liga/profile-katherine.jpg",
        gen: "Generasi 9",
        hashtag: "#Kathmis"
      },
      {
        id: "mikaela",
        name: "Mikaela Kusjanto",
        avatar: "../img/liga/profile-mikaela.jpg",
        gen: "Generasi 13",
        hashtag: "#Mikamis"
      }
    ],

    weeks: [
      {
        week: 1,
        label: "2025-10-09",
        winnerPhoto: "../img/liga/weeks/week1-michelle.jpeg",
        winnerCaption: "",
        winnerSource: "https://x.com/Michie_JKT48/status/1976112153183867049",
        results: [
          { memberId: "michelle",  votes: 13, points: 5 },
          { memberId: "katherine", votes: 3,  points: 3 },
          { memberId: "mikaela",   votes: 0,  points: 1 }
        ]
      },
      {
        week: 2,
        label: "2025-10-16",
        winnerPhoto: "../img/liga/weeks/week2-katherine.jpeg",
        winnerCaption: "",
        winnerSource: "https://x.com/I_KathrinaJKT48/status/1978788128149344675",
        results: [
          { memberId: "katherine", votes: 9, points: 5 },
          { memberId: "michelle",  votes: 7, points: 3 },
          { memberId: "mikaela",   votes: 0, points: 1 }
        ]
      },
      {
        week: 3,
        label: "2025-10-23",
        winnerPhoto: "../img/liga/weeks/week3-katherine.jpeg",
        winnerCaption: "",
        winnerSource: "https://x.com/I_KathrinaJKT48/status/1981300862338420853",
        results: [
          { memberId: "katherine", votes: 13, points: 5 },
          { memberId: "mikaela",   votes: 3,  points: 3 },
          { memberId: "michelle",  votes: 0,  points: 1 }
        ]
      },
      {
        week: 4,
        label: "2025-11-06",
        winnerPhoto: "../img/liga/weeks/week4-michelle.jpeg",
        winnerCaption: "#KaMich 🖤💗",
        winnerSource: "https://x.com/Michie_JKT48/status/1986328055691026773",
        results: [
          { memberId: "michelle",  votes: 9,  points: 5 },
          { memberId: "katherine", votes: 7,  points: 3 },
          { memberId: "mikaela",   votes: 0,  points: 1 }
        ]
      },
      {
        week: 5,
        label: "2025-11-13",
        winnerPhoto: "../img/liga/weeks/week5-katherine.jpeg",
        winnerCaption: "yg penting ngumpulin #Kathmis",
        winnerSource: "https://x.com/I_KathrinaJKT48/status/1989037329626112254",
        results: [
          { memberId: "katherine", votes: 14, points: 5 },
          { memberId: "michelle",  votes: 2,  points: 3 },
          { memberId: "mikaela",   votes: 0,  points: 1 }
        ]
      },
      {
        week: 6,
        label: "2025-11-20",
        winnerPhoto: "../img/liga/weeks/week6-katherine.jpg",
        winnerCaption: "",
        winnerSource: "https://x.com/I_KathrinaJKT48/status/1991404118976655376",
        results: [
          { memberId: "katherine", votes: 14, points: 5 },
          { memberId: "michelle",  votes: 2,  points: 3 },
          { memberId: "mikaela",   votes: 0,  points: 1 }
        ]
      },
      {
        week: 7,
        label: "2025-11-27",
        winnerPhoto: "../img/liga/weeks/week7-katherine.jpg",
        winnerCaption: "#SemangAtin #KathMis",
        winnerSource: "https://x.com/I_KathrinaJKT48/status/1993946521956676020",
        results: [
          { memberId: "katherine", votes: 10, points: 5 },
          { memberId: "michelle",  votes: 2,  points: 3 },
          { memberId: "mikaela",   votes: 0,  points: 1 }
        ]
      },
    ]
  },

  // ===========================
  // SEASON 2 (MASIH KOSONG)
  // ===========================
  {
    seasonId: "2026-S1",
    label: "Season 2 — Jan–Mar 2026",
    plannedWeeks: 12,
    hidden: true, //digembok dulu bosque
    members: [
      // untuk sekarang pakai peserta yang sama
      {
        id: "michelle",
        name: "Michelle Alexandra",
        avatar: "../img/liga/profile-michelle.jpg",
        gen: "Generasi 11",
        hashtag: "#KaMich"
      },
      {
        id: "katherine",
        name: "Katherine Irenne",
        avatar: "../img/liga/profile-katherine.jpg",
        gen: "Generasi 8",
        hashtag: "#Kathmis"
      },
      {
        id: "mikaela",
        name: "Mikaela Kusjanto",
        avatar: "../img/liga/profile-mikaela.jpg",
        gen: "Generasi 13",
        hashtag: "#Mikamis"
      }
    ],
    weeks: [] // BELUM DIMULAI
  }
];

// fallback supaya file lama yang pakai LIGA_DATA masih jalan
window.LIGA_DATA = window.LIGA_SEASONS[0];
