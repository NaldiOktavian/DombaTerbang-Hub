// ===============================
// CHAMPIONS LEAGUE PARTICIPANTS
// ===============================

const clParticipants = [
  // ===== LIGA KAMIS (3) =====
  {
    id: "thu-1",
    name: "Katherine Irenne",
    league: "Liga Kamis",
    seed: 1,
    avatar: "../img/liga/profile-katherine.jpg",
    photo: "../img/liga/champions/photo-katherine.jpg"
  },
  {
    id: "thu-2",
    name: "Michelle Alexandra",
    league: "Liga Kamis",
    seed: 2,
    avatar: "../img/liga/champions/avatar-michelle.png",
    photo: "../img/liga/champions/photo-michelle.jpg"
  },
  {
    id: "thu-3",
    name: "Mikaela Kusjanto",
    league: "Liga Kamis",
    seed: 3,
    avatar: "../img/liga/champions/avatar-mikaela.png",
    photo: "../img/liga/champions/photo-mikaela.jpg"
  },

  // ===== LIGA MONDAY (5) =====
  {
    id: "mon-1",
    name: "Nala",
    league: "Liga Monday",
    seed: 4,
    avatar: "../img/liga/champions/avatar-nala.png",
    photo: "../img/liga/champions/photo-nala.jpg"
  },
  {
    id: "mon-2",
    name: "Indah Cahya",
    league: "Liga Monday",
    seed: 5,
    avatar: "../img/liga/champions/avatar-indah.png",
    photo: "../img/liga/champions/photo-indah.jpg"
  },
  {
    id: "mon-3",
    name: "Jemima Evodie",
    league: "Liga Monday",
    seed: 6,
    avatar: "../img/liga/profile-jemima.jpg",
    photo: "../img/liga/champions/photo-jemima.jpg"
  },
  {
    id: "mon-4",
    name: "Cynthia Yaputera",
    league: "Liga Monday",
    seed: 7,
    avatar: "../img/liga/champions/avatar-cynthia.png",
    photo: "../img/liga/champions/photo-cynthia.jpg"
  },
  {
    id: "mon-5",
    name: "Anin",
    league: "Liga Monday",
    seed: 8,
    avatar: "../img/liga/champions/avatar-anin.png",
    photo: "../img/liga/champions/photo-anin.jpg"
  }
];


// ===============================
// CHAMPIONS STATUS
// ===============================
const CHAMPIONS_STATUS = "PRE"; 
// "PRE" | "LIVE" | "DONE"


// ===============================
// CHAMPIONS LEAGUE BRACKET
// ===============================

const clRounds = [
  {
    id: "qf",
    name: "Quarter Finals",
    matches: [
      { id: "qf1", home: "thu-1", away: "mon-5", winner: null },
      { id: "qf2", home: "thu-2", away: "mon-4", winner: null },
      { id: "qf3", home: "thu-3", away: "mon-3", winner: null },
      { id: "qf4", home: "mon-1", away: "mon-2", winner: null }
    ]
  },
  {
    id: "sf",
    name: "Semi Finals",
    matches: [
      { id: "sf1", from: ["qf1", "qf2"], winner: null },
      { id: "sf2", from: ["qf3", "qf4"], winner: null }
    ]
  },
  {
    id: "final",
    name: "Grand Final",
    matches: [
      { id: "f1", from: ["sf1", "sf2"], winner: "thu-1" }
    ]
  }
];

// ===============================
// STATE STORAGE (SAVE / LOAD)
// ===============================

const STORAGE_KEY = "DTSL_CHAMPIONS_STATE";

function loadChampionsState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveChampionsState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ rounds: clRounds })
  );
}

/* HELPER */

function getParticipant(id) {
  return clParticipants.find(p => p.id === id);
}

function getMatchWinner(matchId) {
  for (const round of clRounds) {
    const m = round.matches.find(x => x.id === matchId);
    if (m && m.winner) return m.winner;
  }
  return null;
}

function resolveMatchSide(match, side) {
  if (match[side]) return match[side];

  if (match.from) {
    const index = side === "home" ? 0 : 1;
    return getMatchWinner(match.from[index]);
  }

  return null;
}

function setMatchWinner(matchId, winnerId) {
  for (const round of clRounds) {
    const match = round.matches.find(m => m.id === matchId);
    if (!match) continue;

    // 🔒 kalau sudah ada pemenang, jangan bisa diganti
    if (match.winner) {
      return;
    }

    match.winner = winnerId;
    saveChampionsState();
    renderChampionsBracket();
    return;
  }
}

function renderTeam(p, match) {
  if (!p) {
    return `<div class="cl-team empty">TBD</div>`;
  }

  const isWinner = match.winner === p.id;
  const isLoser = match.winner && match.winner !== p.id;

  return `
    <div class="cl-team 
      ${isWinner ? "winner" : ""} 
      ${isLoser ? "loser" : ""}">
      
      <img src="${p.avatar}" alt="${p.name}">
      <div>
        <div class="cl-name">${p.name}</div>
        <div class="cl-league">${p.league}</div>
      </div>
    </div>
  `;
}

function renderChampionsBracket() {
  clRounds.forEach(round => {
    round.matches.forEach(match => {
      const el = document.querySelector(
        `[data-match="${match.id}"]`
      );
      if (!el) return;

      // MODE PRE: jangan resolve winner
      if (CHAMPIONS_STATUS === "PRE") {
        el.innerHTML = `
          <div class="cl-match disabled">
            <div class="cl-team empty">TBD</div>
            <span class="cl-vs">VS</span>
            <div class="cl-team empty">TBD</div>
          </div>
        `;
        return;
      }

      // MODE LIVE / DONE (kode lama kamu tetap)
      const homeId = resolveMatchSide(match, "home");
      const awayId = resolveMatchSide(match, "away");

      const home = homeId ? getParticipant(homeId) : null;
      const away = awayId ? getParticipant(awayId) : null;

      el.innerHTML = `
        <div class="cl-match">
          ${renderTeam(home, match)}
          <span class="cl-vs">VS</span>
          ${renderTeam(away, match)}
        </div>
      `;
    });
  });

  if (CHAMPIONS_STATUS !== "PRE") {
    renderChampionPanel();
  }
}


function renderChampionPanel() {
  const finalRound = clRounds.find(r => r.id === "final");
  if (!finalRound) return;

  const finalMatch = finalRound.matches[0];
  const panel = document.getElementById("clChampionPanel");
  const nameEl = document.getElementById("clChampionName");

  if (!panel || !nameEl) return;

  // Belum ada juara
  if (!finalMatch.winner) {
    panel.classList.remove("revealed");
    nameEl.textContent = "-";
    return;
  }

  const champ = getParticipant(finalMatch.winner);
  if (!champ) return;

  panel.classList.add("revealed");
  nameEl.innerHTML = `
    <div class="cl-champion-avatar">
      <img src="${champ.avatar}" alt="${champ.name}">
      <span class="cl-crown">👑</span>
    </div>
    <div class="cl-champion-name">${champ.name}</div>
    <div class="cl-champion-league">${champ.league}</div>
  `;
}

/* RENDER PARTICIPANTS */

function renderParticipants() {
  const wrap = document.getElementById("clParticipants");
  if (!wrap) return;

  wrap.innerHTML = clParticipants
    .sort((a, b) => a.seed - b.seed)
    .map(p => `
      <div class="cl-team-card">
        <img src="${p.avatar}" alt="${p.name}">
        <div class="cl-team-name">${p.name}</div>
        <div class="cl-team-league">${p.league}</div>
      </div>
    `).join("");
  
  if (CHAMPIONS_STATUS === "PRE") {
    container.insertAdjacentHTML("beforebegin", `
      <p class="liga-sub">
        Delapan peserta terbaik dari Liga Kamis & Monday Prieme League
        yang akan bertanding di DTSL Champions League.
      </p>
    `);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderParticipants();
  renderChampionsBracket();
});
