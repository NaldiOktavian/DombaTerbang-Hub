// liga/liga-data.js

window.LIGA_SEASONS = [
  // ===========================
  // SEASON 1 (data yang sekarang)
  // ===========================
  {
    seasonId: "2025-S1",
    label: "Season 1 — Oct–Dec 2025",
    plannedWeeks: 12, // target minggu season ini
    finished: true,

    members: [
      {
        id: "michelle",
        name: "Michelle Alexandra",
        avatar: "../img/liga/profile-michelle.webp",
        podiumImage: "../img/liga/weeks/michelle-podium.webp",
        gen: "Generasi 11",
        hashtag: "#KaMich"
      },
      {
        id: "katherine",
        name: "Katherine Irenne",
        avatar: "../img/liga/profile-katherine.webp",
        podiumImage: "../img/liga/weeks/atin-podium.webp",
        gen: "Generasi 9",
        hashtag: "#Kathmis"
      },
      {
        id: "mikaela",
        name: "Mikaela Kusjanto",
        avatar: "../img/liga/profile-mikaela.webp",
        podiumImage: "../img/liga/weeks/mikaela-podium.webp",
        gen: "Generasi 13",
        hashtag: "#Mikamis"
      }
    ],

    weeks: [
      {
        week: 1,
        label: "2025-10-09",
        winnerPhoto: "../img/liga/weeks/week1-michelle.webp",
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
        winnerPhoto: "../img/liga/weeks/week2-katherine.webp",
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
        winnerPhoto: "../img/liga/weeks/week3-katherine.webp",
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
        winnerPhoto: "../img/liga/weeks/week4-michelle.webp",
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
        winnerPhoto: "../img/liga/weeks/week5-katherine.webp",
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
        winnerPhoto: "../img/liga/weeks/week6-katherine.webp",
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
        winnerPhoto: "../img/liga/weeks/week7-katherine.webp",
        winnerCaption: "#SemangAtin #KathMis",
        winnerSource: "https://x.com/I_KathrinaJKT48/status/1993946521956676020",
        results: [
          { memberId: "katherine", votes: 10, points: 5 },
          { memberId: "michelle",  votes: 2,  points: 3 },
          { memberId: "mikaela",   votes: 0,  points: 1 }
        ]
      },
      {
        week: 8,
        label: "2025-12-04",
        winnerPhoto: "../img/liga/weeks/week8-katherine.webp",
        winnerCaption: "orangnya dan highscore block blast nya #Kathmis",
        winnerSource: "https://x.com/I_KathrinaJKT48/status/1996560328134668558",
        results: [
          { memberId: "katherine", votes: 4, points: 5 },
          { memberId: "mikaela",   votes: 3,  points: 3 },
          { memberId: "michelle",  votes: 0,  points: 1 }
        ]
      },
      {
        week: 9,
        label: "2025-12-11",
        winnerPhoto: "../img/liga/weeks/week9-mikaela.webp",
        winnerCaption: "#Mikamis hehehe",
        winnerSource: "https://x.com/M_MikaelaJKT48/status/1996422161247179004",
        results: [
          { memberId: "mikaela",   votes: 6,  points: 5 },
          { memberId: "michelle",  votes: 5,  points: 3 },
          { memberId: "katherine", votes: 0, points: 0 }
        ]
      },     
      {
        week: 10,
        label: "2025-12-18",
        winnerPhoto: "../img/liga/weeks/week10-michie.webp",
        winnerCaption: "#KaMich more on instagraAaaaamm",
        winnerSource: "https://x.com/Michie_JKT48/status/2001665621080355113",
        results: [
          { memberId: "michelle",  votes: 10,  points: 5 },
          { memberId: "mikaela",   votes: 0,  points: 0 },
          { memberId: "katherine", votes: 0, points: 0 }
        ]
      },       
    ]
  },

  // ===========================
  // SEASON 2 (MASIH KOSONG)
  // ===========================
  {
    seasonId: "2026-S2",
    label: "Season 2 — Jan–Mar 2026",
    plannedWeeks: 12,
    hidden: false, //digembok dulu bosque
    members: [
      {
        id: "michelle",
        name: "Michelle Alexandra",
        avatar: "../img/liga/profile-michelle.webp",
        podiumImage: "../img/liga/weeks/michelle-podium-s2.webp",
        gen: "Generasi 11",
        hashtag: "#KaMich"
      },
      {
        id: "katherine",
        name: "Katherine Irenne",
        avatar: "../img/liga/profile-katherine.webp",
        podiumImage: "../img/liga/weeks/kathrine-podium-s2.webp",
        gen: "Generasi 9",
        hashtag: "#Kathmis"
      },
      {
        id: "mikaela",
        name: "Mikaela Kusjanto",
        avatar: "../img/liga/profile-mikaela.webp",
        podiumImage: "../img/liga/weeks/mikaela-podium.webp",
        gen: "Generasi 13",
        hashtag: "#Mikamis"
      }
    ],
    weeks: [
            {
        week: 1,
        label: "2026-15-01",
        winnerPhoto: "../img/liga/weeks/s2-week1-michelle.webp",
        winnerCaption: "#KaMich",
        winnerSource: "https://x.com/i/status/2011712377415483736",
        results: [
          { memberId: "michelle",  votes: 10, points: 5 },
          { memberId: "mikaela",   votes: 2,  points: 3 },
          { memberId: "katherine", votes: 0,  points: 1 }
        ]
      },
            {
        week: 2,
        label: "2026-22-01",
        winnerPhoto: "../img/liga/weeks/s2-week2-katherine.webp",
        winnerCaption: "#KathMis",
        winnerSource: "https://x.com/I_KathrinaJKT48/status/2014356403549507905",
        results: [
          { memberId: "katherine", votes: 6,  points: 5 },
          { memberId: "mikaela",   votes: 3,  points: 3 },
          { memberId: "michelle",  votes: 1, points: 1 }
        ]
      },
            {
        week: 3,
        label: "2026-29-01",
        winnerPhoto: "../img/liga/weeks/s2-week3-michelle.webp",
        winnerCaption: "#KaMich sikat gigi kids",
        winnerSource: "https://x.com/Michie_JKT48/status/2016750222358302944",
        results: [
          { memberId: "katherine", votes: 0,  points: 1 },
          { memberId: "mikaela",   votes: 1,  points: 3 },
          { memberId: "michelle",  votes: 12, points: 5 }
        ]
      },
    ] // BELUM DIMULAI
  }
];

// fallback supaya file lama yang pakai LIGA_DATA masih jalan
window.LIGA_DATA = window.LIGA_SEASONS[0];
