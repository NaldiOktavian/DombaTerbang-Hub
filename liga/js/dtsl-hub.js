// =======================================
// DTSL HUB – CONFIG STATUS
// =======================================

const dtslConfig = {
  seasonLabel: "Season 1",
  modeLabel: "Regular Season",
  leagues: {
    monday: {
      status: "upcoming", // "live" | "upcoming" | "off"
      statusText: "Matchday Senin malam • 20.00 WIB",
      metaText: "Season 1 • Matchday 1",
    },
    thursday: {
      status: "live",
      statusText: "Voting Liga Kamis sedang berlangsung",
      metaText: "Season 1 • Matchday berjalan",
    },
    champions: {
      status: "off",
      statusText: "Menunggu akhir musim Monday & Kamis",
      metaText: "Knockout 6 peserta • belum dimulai",
      stageLabel: "Menunggu kualifikasi selesai",
    },
  },
};

// =======================================
// THEME TOGGLE (FULL DARK/LIGHT BODY)
// =======================================

function initDtslTheme() {
  const btn = document.getElementById("dtslThemeToggle");
  const body = document.body;
  const STORAGE_KEY = "dtsl-hub-theme";

  function apply(theme) {
    if (theme === "dark") {
      body.classList.add("dark");
      btn.textContent = "🌙 Dark Mode";
    } else {
      body.classList.remove("dark");
      btn.textContent = "🌤️ Light Mode";
    }
  }

  // load saved
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved) {
    apply(saved);
  }

  btn.addEventListener("click", () => {
    const next = body.classList.contains("dark") ? "light" : "dark";
    apply(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  });
}

// =======================================
// STATUS & META RENDER
// =======================================

function renderDtslHeader() {
  const seasonEl = document.getElementById("dtslSeasonLabel");
  const modeEl = document.getElementById("dtslHeroModeLabel");
  const todayEl = document.getElementById("dtslTodayLabel");

  if (seasonEl) seasonEl.textContent = dtslConfig.seasonLabel;
  if (modeEl) modeEl.textContent = dtslConfig.modeLabel;

  if (todayEl) {
    const now = new Date();
    todayEl.textContent = now.toLocaleString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
}

function updateLeagueStatusDot(id, status, text) {
  const dot = document.getElementById(`statusDot${id}`);
  const txt = document.getElementById(`statusText${id}`);
  if (!dot || !txt) return;

  dot.classList.remove("live", "upcoming", "off");
  dot.classList.add(status);
  txt.textContent = text;
}

function renderDtslLeagueStatus() {
  const leagues = dtslConfig.leagues;

  // Monday
  if (leagues.monday) {
    updateLeagueStatusDot("Monday", leagues.monday.status, leagues.monday.statusText);

    const statusEl = document.querySelector('[data-league-status="monday"]');
    const metaEl = document.querySelector('[data-league-meta="monday"]');
    if (statusEl) {
      statusEl.textContent =
        leagues.monday.status === "live"
          ? "LIVE"
          : leagues.monday.status === "upcoming"
          ? "Upcoming"
          : "Off Season";
      statusEl.classList.add(leagues.monday.status);
    }
    if (metaEl) {
      metaEl.textContent = leagues.monday.metaText;
    }
  }

  // Thursday
  if (leagues.thursday) {
    updateLeagueStatusDot("Thursday", leagues.thursday.status, leagues.thursday.statusText);

    const statusEl = document.querySelector('[data-league-status="thursday"]');
    const metaEl = document.querySelector('[data-league-meta="thursday"]');
    if (statusEl) {
      statusEl.textContent =
        leagues.thursday.status === "live"
          ? "LIVE"
          : leagues.thursday.status === "upcoming"
          ? "Upcoming"
          : "Off Season";
      statusEl.classList.add(leagues.thursday.status);
    }
    if (metaEl) {
      metaEl.textContent = leagues.thursday.metaText;
    }
  }

  // Champions
  if (leagues.champions) {
    updateLeagueStatusDot("Champions", leagues.champions.status, leagues.champions.statusText);

    const statusEl = document.querySelector('[data-league-status="champions"]');
    const metaEl = document.querySelector('[data-league-meta="champions"]');
    const stageEl = document.getElementById("clStageMeta");

    if (statusEl) {
      statusEl.textContent =
        leagues.champions.status === "live"
          ? "On Going"
          : leagues.champions.status === "upcoming"
          ? "Soon"
          : "Not Started";
      statusEl.classList.add(leagues.champions.status);
    }

    if (metaEl) {
      metaEl.textContent = leagues.champions.metaText;
    }

    if (stageEl && leagues.champions.stageLabel) {
      stageEl.textContent = leagues.champions.stageLabel;
    }
  }
}

// =======================================
// INIT
// =======================================

document.addEventListener("DOMContentLoaded", () => {
  initDtslTheme();
  renderDtslHeader();
  renderDtslLeagueStatus();
});
