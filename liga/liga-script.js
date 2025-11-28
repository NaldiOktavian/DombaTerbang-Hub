/* ==========================================
   DombaTerbang Super League – liga-script.js
   Bekerja dengan window.LIGA_DATA + liga.html
========================================== */

/* ===== SYNC THEME DARI HUB KE LIGA ===== */
(function syncLigaTheme() {
  const saved = localStorage.getItem('dt-theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
})();

(function () {
  const seasons = window.LIGA_SEASONS || [];
  if (!seasons.length) {
    console.error("LIGA_SEASONS tidak ditemukan. Pastikan liga-data.js sudah ter-load.");
    return;
  }

    function pickSeason() {
    const params = new URLSearchParams(window.location.search);
    const seasonId = params.get("season");

    const visibleSeasons = seasons.filter((s) => !s.hidden);
    const defaultSeason = visibleSeasons[0] || seasons[0];

    if (seasonId) {
      const found = seasons.find(
        (s) => s.seasonId === seasonId && !s.hidden
      );
      if (found) return found;
    }

    return defaultSeason;
  }


  const data = pickSeason();

  /* ------------ Helper dasar ------------ */

  function getEl(id) {
    return document.getElementById(id);
  }

  function buildMemberIndex(members) {
    const map = {};
    members.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }

  const memberIndex = buildMemberIndex(data.members || []);

    let weekFilterMember = "all";
    let weekSortMode = "newest";
    let countdownTimerId = null;

    function getNextThursday(baseDate) {
      const d = new Date(baseDate);
      const day = d.getDay(); // 0=Sun, 4=Thu
      const target = 4;
      let diff = target - day;
      if (diff <= 0) diff += 7;
      d.setDate(d.getDate() + diff);
      d.setHours(20, 0, 0, 0); // misal matchday jam 20.00
      return d;
    }

  function sortWeeksAsc(weeks) {
    return [...weeks].sort((a, b) => a.week - b.week);
  }

  function sortWeeksDesc(weeks) {
    return [...weeks].sort((a, b) => b.week - a.week);
  }

  function sortResultsForPodium(results) {
    // Urutkan: poin terbesar → vote terbanyak → memberId (biar stabil)
    return [...results].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.votes !== a.votes) return b.votes - a.votes;
      return String(a.memberId).localeCompare(String(b.memberId));
    });
  }

    function renderSeasonSwitch() {
    const el = getEl("ligaSeasonSwitch");
    const visibleSeasons = seasons.filter((s) => !s.hidden);
    if (!el || visibleSeasons.length <= 1) return;

    const currentId = data.seasonId;

    el.innerHTML =
      `<div class="liga-season-label">Season</div>` +
      visibleSeasons
        .map((s) => {
          const active = s.seasonId === currentId;
          const label = s.label || s.seasonId;
          const href = `?season=${encodeURIComponent(s.seasonId)}`;
          return `
            <a href="${href}"
              class="liga-season-pill ${active ? "active" : ""}">
              ${label.replace("Season ", "S")}
            </a>
          `;
        })
        .join("");
  }

    function renderSeasonNotice(totalWeeks) {
      const noticeEl = getEl("ligaSeasonNotice");
      if (!noticeEl) return;

      if (!totalWeeks) {
        noticeEl.innerHTML = `
          <div class="liga-empty-season">
            Season ini belum dimulai. Matchday pertama akan diumumkan segera. ✨
          </div>
        `;
      } else {
        noticeEl.innerHTML = "";
      }
    }


  /* ==========================================
     1. HITUNG KLASEMEN SEASON
  =========================================== */
    function buildSeasonStandings() {
      const statsMap = {};

      // Inisialisasi object statistik per member
      data.members.forEach((m) => {
        statsMap[m.id] = {
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          gen: m.gen,
          hashtag: m.hashtag || "",
          totalPoints: 0,
          totalVotes: 0,
          first: 0,
          second: 0,
          third: 0,
          weeksPlayed: 0,
          form: [] // urutan poin per minggu (dari week 1 ke terakhir)
        };
      });

      const weeksAsc = sortWeeksAsc(data.weeks || []);

      // akumulasi semua minggu (untuk klasemen sekarang)
      weeksAsc.forEach((week) => {
        (week.results || []).forEach((r) => {
          const s = statsMap[r.memberId];
          if (!s) return;

          s.weeksPlayed += 1;
          s.totalPoints += r.points || 0;
          s.totalVotes += r.votes || 0;
          s.form.push(r.points || 0);

          if (r.points === 5) s.first += 1;
          else if (r.points === 3) s.second += 1;
          else if (r.points === 1) s.third += 1;
        });
      });

      // helper buat comparator yang sama dipakai sekarang & sebelumnya
      function compareStandings(a, b) {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.totalVotes !== a.totalVotes) return b.totalVotes - a.totalVotes;
        return a.name.localeCompare(b.name);
      }

      const list = Object.values(statsMap);

      // hitung rank minggu SEBELUMNYA (buat indikator naik/turun)
      const prevRankMap = {};
      if (weeksAsc.length > 1) {
        const prevStatsMap = {};

        // init ulang
        data.members.forEach((m) => {
          prevStatsMap[m.id] = {
            id: m.id,
            name: m.name,
            avatar: m.avatar,
            gen: m.gen,
            totalPoints: 0,
            totalVotes: 0
          };
        });

        const weeksPrev = weeksAsc.slice(0, weeksAsc.length - 1);
        weeksPrev.forEach((week) => {
          (week.results || []).forEach((r) => {
            const s = prevStatsMap[r.memberId];
            if (!s) return;
            s.totalPoints += r.points || 0;
            s.totalVotes += r.votes || 0;
          });
        });

        const prevList = Object.values(prevStatsMap).sort(compareStandings);
        prevList.forEach((s, idx) => {
          prevRankMap[s.id] = idx + 1; // rank 1-based
        });
      }

      // Urutkan klasemen: poin → total vote → nama
      list.sort(compareStandings);

      // set rank + trend (up / down / same / new)
      list.forEach((s, idx) => {
        const currentRank = idx + 1;
        const prevRank = prevRankMap[s.id];

        s.rank = currentRank;

        if (!prevRank) {
          s.trend = "new";      // belum ada perbandingan, pendatang baru / minggu pertama
        } else if (prevRank > currentRank) {
          s.trend = "up";       // naik
        } else if (prevRank < currentRank) {
          s.trend = "down";     // turun
        } else {
          s.trend = "same";     // tetap
        }
      });

      return list;
    }


  /* ==========================================
     2. RENDER KLASEMEN SEASON (liga.html)
  =========================================== */

  function renderFormDots(formArr) {
    if (!formArr || !formArr.length) return "";

    return formArr
      .map((value) => {
        if (value === 5) return `<span class="lg-form-dot lg-form-5">🥇</span>`;
        if (value === 3) return `<span class="lg-form-dot lg-form-3">🥈</span>`;
        if (value === 1) return `<span class="lg-form-dot lg-form-1">🥉</span>`;
        return `<span class="lg-form-dot lg-form-0">•</span>`;
      })
      .join("");
  }

  function renderSeasonTable(standings) {
    const tbody = getEl("ligaTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    standings.forEach((s) => {
      const rank = s.rank || 0;
      const isChampion = rank === 1;

      let trendClass = "lg-trend-new";
      let trendIcon = "★";
      let trendLabel = "Pendatang baru";

      if (s.trend === "up") {
        trendClass = "lg-trend-up";
        trendIcon = "↑";
        trendLabel = "Naik posisi";
      } else if (s.trend === "down") {
        trendClass = "lg-trend-down";
        trendIcon = "↓";
        trendLabel = "Turun posisi";
      } else if (s.trend === "same") {
        trendClass = "lg-trend-same";
        trendIcon = "•";
        trendLabel = "Posisi tetap";
      }

      const rowClass = isChampion ? "lg-row-champion" : "";

      tbody.insertAdjacentHTML(
        "beforeend",
        `
        <tr class="${rowClass}">
          <td>
            <div class="lg-rank-cell">
              <span class="lg-rank-number">${rank}</span>
              <span class="lg-rank-trend ${trendClass}" title="${trendLabel}">
                ${trendIcon}
              </span>
            </div>
          </td>
          <td>
            <div class="lg-member-info">
              <img src="${s.avatar}" alt="${s.name}" class="lg-member-avatar" />
              <div>
                <div class="lg-name">
                  ${s.name}
                  ${
                    isChampion
                      ? `<span class="lg-champion-badge"></span>`
                      : ""
                  }
                </div>
                <div class="lg-sub">${s.gen || ""}</div>
              </div>
            </div>
          </td>
          <td>${s.totalPoints}</td>
          <td>${s.first}</td>
          <td>${s.second}</td>
          <td>${s.third}</td>
          <td>${s.totalVotes}</td>
          <td class="lg-form">
            ${renderFormDots(s.form)}
          </td>
        </tr>
      `
      );
    });
  }


  /* ==========================================
     3. PODIUM MINGGU TERAKHIR (liga.html)
     → pakai layout .liga-podium-123 v3
  =========================================== */

  function renderLatestWeekPodium() {
    const podiumEl = getEl("ligaCurrentPodium");
    if (!podiumEl) return;

    const weeks = data.weeks || [];

    // kalau belum ada minggu sama sekali
    if (!weeks.length) {
      podiumEl.innerHTML = `
        <p class="liga-sub">Belum ada hasil minggu terakhir.</p>
      `;
      return;
    }

    const latest = sortWeeksDesc(weeks)[0];
    const resultsSorted = sortResultsForPodium(latest.results || []);

    if (!resultsSorted.length) {
      podiumEl.innerHTML = `
        <p class="liga-sub">Belum ada data hasil untuk minggu ini.</p>
      `;
      return;
    }

    const top3Raw = resultsSorted.slice(0, 3);

    // mapping ke view model + kasih rank 1/2/3
    const podiumData = [];
    if (top3Raw[0]) {
      const m = memberIndex[top3Raw[0].memberId] || {};
      podiumData.push({
        rank: 1,
        name: m.name || top3Raw[0].memberId,
        avatar: m.avatar,
        votes: top3Raw[0].votes || 0,
        points: top3Raw[0].points || 0,
      });
    }
    if (top3Raw[1]) {
      const m = memberIndex[top3Raw[1].memberId] || {};
      podiumData.push({
        rank: 2,
        name: m.name || top3Raw[1].memberId,
        avatar: m.avatar,
        votes: top3Raw[1].votes || 0,
        points: top3Raw[1].points || 0,
      });
    }
    if (top3Raw[2]) {
      const m = memberIndex[top3Raw[2].memberId] || {};
      podiumData.push({
        rank: 3,
        name: m.name || top3Raw[2].memberId,
        avatar: m.avatar,
        votes: top3Raw[2].votes || 0,
        points: top3Raw[2].points || 0,
      });
    }

    // helper ambil slot berdasarkan rank
    function getSlot(rank) {
      return podiumData.find((p) => p.rank === rank);
    }

    // markup sesuai CSS baru:
    // .liga-podium-123 > .podium-wrapper > .podium.podium-1/2/3
    let html = '<div class="podium-wrapper">';

    [2, 1, 3].forEach((rank) => {
      const slot = getSlot(rank);
      if (!slot) return;

      html += `
        <article class="podium podium-${rank}">
          <div class="podium-rank">${rank}</div>
          ${
            slot.avatar
              ? `<img src="${slot.avatar}" alt="${slot.name}">`
              : ""
          }
          <div class="podium-name">${slot.name}</div>
          <div class="podium-sub">${slot.votes} vote • ${slot.points} pts</div>
        </article>
      `;
    });

    html += "</div>";
    podiumEl.innerHTML = html;
  }


  /* ==========================================
     4. HASIL PER MINGGU (GRID CARD liga.html)
  =========================================== */

  function renderWeeklyCards() {
    const container = getEl("ligaWeeks");
    if (!container) return;

    let weeksList = [...(data.weeks || [])];

    // Filter by member (berdasarkan JUARA 1)
    if (weekFilterMember !== "all") {
      weeksList = weeksList.filter((week) => {
        const sorted = sortResultsForPodium(week.results || []);
        const top = sorted[0];
        return top && top.memberId === weekFilterMember;
      });
    }


    // Sort
    if (weekSortMode === "oldest") {
      weeksList.sort((a, b) => a.week - b.week);
    } else if (weekSortMode === "votes") {
      const maxVotes = (w) =>
        Math.max(...(w.results || []).map((r) => r.votes || 0), 0);
      weeksList.sort((a, b) => maxVotes(b) - maxVotes(a));
    } else {
      // newest (default)
      weeksList.sort((a, b) => b.week - a.week);
    }

    container.innerHTML = "";

    // empty state kalau setelah filter nggak ada minggu
    if (weeksList.length === 0) {
      let title = "";
      let sub = "";

      if (weekFilterMember === "michelle") {
        title = "Belum ada minggu yang dimenangkan Michelle di filter ini 🤔";
        sub =
          "Tenang, KaMich selalu siap comeback. Coba cek filter lain atau tunggu matchday berikutnya! 🖤💗";
      } else if (weekFilterMember === "katherine") {
        title = "Belum ada kemenangan untuk Katherine di filter ini 😳";
        sub =
          "Kathmis nggak pernah menyerah. Siap-siap lihat dia naik podium di minggu berikutnya! 💙💛";
      } else if (weekFilterMember === "mikaela") {
        title = "Mikaela belum pernah menjadi juara 🥹";
        sub =
          "Saatnya Mikamis unjuk gigi! Gas vote yang kenceng di matchday berikutnya yaaa ✨";
      } else if (weekFilterMember === "all") {
        title = "Belum ada minggu yang tercatat di season ini 📭";
        sub = "Season baru mungkin belum dimulai. Stay tuned untuk matchday perdana!";
      } else {
        // fallback generic
        const memberName =
          memberIndex[weekFilterMember]?.name || weekFilterMember || "Member ini";
        title = `${memberName} belum punya kemenangan yang cocok dengan filter ini 😌`;
        sub =
          "Coba ganti filter, atau tunggu matchday berikutnya untuk hasil yang lebih seru!";
      }

      container.innerHTML = `
        <div class="liga-empty-state">
          <div class="liga-empty-title">${title}</div>
          <div class="liga-empty-sub">${sub}</div>
        </div>
      `;
      return;
    }


    weeksList.forEach((week) => {
      const resultsSorted = sortResultsForPodium(week.results || []);
      if (!resultsSorted.length) return;

      const top = resultsSorted[0];
      const member = memberIndex[top.memberId] || {};

      container.insertAdjacentHTML(
        "beforeend",
        `
        <a class="lg-week-card" href="liga-week.html?week=${encodeURIComponent(
          week.week
        )}">
          <div class="lg-week-header">
            <span class="lg-week-label">Minggu ${week.week}</span>
            <span class="lg-week-date">${week.label}</span>
          </div>

          <div class="lg-week-body">
            <div class="lg-week-winner">
              <div class="lg-week-avatar" style="background-image:url('${
                week.winnerPhoto
              }')"></div>
              <div>
                <div class="lg-week-name">${member.name || top.memberId}</div>
                <div class="lg-week-meta">${top.votes} vote • ${top.points} pts</div>
              </div>
            </div>

            <div class="lg-week-cta">Lihat detail →</div>
          </div>
        </a>
      `
      );
    });
  }

function buildHeadToHead() {
  const members = (data.members || []).map((m) => m.id);
  const stats = {};
  const weeks = data.weeks || [];

  weeks.forEach((week) => {
    const sorted = sortResultsForPodium(week.results || []);
    const rankMap = {};
    sorted.forEach((r, idx) => {
      rankMap[r.memberId] = idx;
    });

    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const a = members[i];
        const b = members[j];
        const key = `${a}|${b}`;
        if (!stats[key]) {
          stats[key] = { aId: a, bId: b, aWins: 0, bWins: 0, total: 0 };
        }

        if (rankMap[a] == null || rankMap[b] == null) continue;

        if (rankMap[a] < rankMap[b]) stats[key].aWins++;
        else if (rankMap[b] < rankMap[a]) stats[key].bWins++;

        stats[key].total++;
      }
    }
  });

  return Object.values(stats);
}

  function renderHeadToHead() {
    const container = getEl("ligaHeadToHead");
    if (!container) return;

    const pairs = buildHeadToHead();
    container.innerHTML = "";

    pairs.forEach((p) => {
      const a = memberIndex[p.aId] || {};
      const b = memberIndex[p.bId] || {};
      const aName = a.name || p.aId;
      const bName = b.name || p.bId;

      let summary;
      if (p.aWins === p.bWins) {
        summary = `Imbang ${p.aWins} – ${p.bWins} dari ${p.total} minggu.`;
      } else if (p.aWins > p.bWins) {
        summary = `${aName} unggul ${p.aWins} – ${p.bWins} dari ${p.total} minggu.`;
      } else {
        summary = `${bName} unggul ${p.bWins} – ${p.aWins} dari ${p.total} minggu.`;
      }

      container.insertAdjacentHTML(
        "beforeend",
        `
        <div class="liga-h2h-card">
          <div class="liga-h2h-names">
            <span>${aName}</span>
            <span class="liga-h2h-score">${p.aWins} – ${p.bWins}</span>
            <span>${bName}</span>
          </div>
          <div class="liga-h2h-sub">${summary}</div>
        </div>
      `
      );
    });
  }


  /* ==========================================
     5. DETAIL MINGGU – liga-week.html
  =========================================== */

  function findWeekByQuery() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("week");
    if (!id) return null;

    const weekNum = Number(id);
    if (!Number.isFinite(weekNum)) return null;

    return (data.weeks || []).find((w) => w.week === weekNum) || null;
  }

  function buildWeekPodium(week) {
    const sorted = sortResultsForPodium(week.results || []);
    const podium = sorted.slice(0, 3).map((r) => {
      const m = memberIndex[r.memberId] || {};
      return {
        id: r.memberId,
        name: m.name || r.memberId,
        avatar: m.avatar,
        gen: m.gen,
        votes: r.votes || 0,
        points: r.points || 0
      };
    });
    return podium;
  }

  function renderWeekDetailPage() {
    // dipanggil hanya jika elemen week-title ada (berarti di liga-week.html)
    const titleEl = getEl("week-title");
    if (!titleEl) return;

    const week = findWeekByQuery();
    if (!week) {
      titleEl.textContent = "Minggu tidak ditemukan";
      return;
    }

    const podium = buildWeekPodium(week);
    const winner = podium[0];
    const caption =
      week.winnerCaption && week.winnerCaption.trim().length
        ? week.winnerCaption
        : winner
        ? memberIndex[winner.id]?.hashtag || "#DombaTerbangLiga"
        : "";

    // Judul
    titleEl.textContent = `Minggu ${week.week} — ${week.label}`;

    // Foto utama
    const photoEl = getEl("week-photo");
    if (photoEl) {
      photoEl.innerHTML = `
        <div class="winner-frame">
          <div class="winner-frame-title">
            🏆 Juara 1 – Week ${week.week}
          </div>
          <img src="${week.winnerPhoto}" alt="Winner Photo" />
        </div>
    `;

    }

    // Panel pemenang
    const winnerPanel = getEl("winner-panel");
    if (winnerPanel && winner) {
      winnerPanel.innerHTML = `
        <div class="winner-info-card">
          <div class="winner-header">
            <img src="${winner.avatar}" class="winner-avatar" alt="${winner.name}" />
            <div class="winner-header-text">
              <div class="winner-name">${winner.name}</div>
              <div class="winner-gen">${winner.gen || ""}</div>
            </div>
          </div>

          <div class="winner-divider"></div>
          <div class="winner-vote-line">
            Vote: <strong>${winner.votes}</strong> • <strong>${winner.points}</strong> pts
          </div>
          <div class="winner-caption-title">Caption:</div>
          <div class="winner-caption">
            ${caption}
          </div>
          ${
            week.winnerSource
              ? `<a href="${week.winnerSource}" class="liga-caption-link" target="_blank" rel="noopener">Lihat Post Asli ↗</a>`
              : ""
          }
        </div>
      `;
    }


        // Podium detail (tiga baris Juara 1/2/3)
    const podiumEl = getEl("week-podium");
    if (podiumEl && podium.length) {
      const rowsHtml = podium
        .map((p, idx) => {
          const medal =
            idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";
          const label =
            idx === 0 ? "Juara 1" : idx === 1 ? "Juara 2" : "Juara 3";
          const rowClass =
            idx === 0
              ? "liga-week-podium-row rank-1"
              : idx === 1
              ? "liga-week-podium-row rank-2"
              : "liga-week-podium-row rank-3";

          return `
            <div class="${rowClass}">
              <div class="liga-week-podium-medal">
                <span class="liga-week-podium-medal-icon">${medal}</span>
                <span>${label}</span>
              </div>
              <div class="liga-week-podium-main">
                ${
                  p.avatar
                    ? `<img src="${p.avatar}" alt="${p.name}" class="liga-week-podium-avatar" />`
                    : ""
                }
                <div class="liga-week-podium-info">
                  <div class="liga-week-podium-name">${p.name}</div>
                  <div class="liga-week-podium-meta">
                    ${p.votes} vote • ${p.points} pts
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .join("");

      podiumEl.innerHTML = `
        <div class="liga-week-podium-list">
          ${rowsHtml}
        </div>
      `;
    }



    // Tabel hasil minggu (urut sesuai podium)
    const tb = getEl("week-table-body");
    if (tb && podium.length) {
      tb.innerHTML = "";
      podium.forEach((p, idx) => {
        tb.insertAdjacentHTML(
          "beforeend",
          `
          <tr>
            <td>${idx + 1}</td>
            <td>
              <div class="lg-member-info">
                ${
                  p.avatar
                    ? `<img src="${p.avatar}" alt="${p.name}">`
                    : ""
                }
                <div class="lg-name">${p.name}</div>
              </div>
            </td>
            <td>${p.votes}</td>
            <td>${p.points}</td>
          </tr>
        `
        );
      });
    }
  }


  //Season Highlights
  function renderSeasonHighlights(standings) {
    const container = getEl("ligaHighlights");
    if (!container || !standings || !standings.length) return;

    const weeks = data.weeks || [];

    // most wins
    const mostWins = [...standings].sort(
      (a, b) => b.first - a.first || b.totalPoints - a.totalPoints
    )[0];

    // highest single-week votes
    let bestWeekEntry = null;
    weeks.forEach((week) => {
      (week.results || []).forEach((r) => {
        if (!bestWeekEntry || (r.votes || 0) > bestWeekEntry.result.votes) {
          bestWeekEntry = { week, result: r };
        }
      });
    });

    const bestMember = bestWeekEntry
      ? memberIndex[bestWeekEntry.result.memberId] || {}
      : null;

    const totalVotesSeason = standings.reduce(
      (sum, s) => sum + (s.totalVotes || 0),
      0
    );

    container.innerHTML = "";

    if (mostWins) {
      container.insertAdjacentHTML(
        "beforeend",
        `
        <div class="liga-highlight-card">
          <div class="liga-highlight-title">Most Wins</div>
          <div class="liga-highlight-main">${mostWins.name}</div>
          <div class="liga-highlight-sub">Juara 1 × ${mostWins.first}</div>
        </div>
      `
      );
    }

    if (bestWeekEntry && bestMember) {
      container.insertAdjacentHTML(
        "beforeend",
        `
        <div class="liga-highlight-card">
          <div class="liga-highlight-title">Highest Votes in a Week</div>
          <div class="liga-highlight-main">${bestMember.name}</div>
          <div class="liga-highlight-sub">
            Week ${bestWeekEntry.week.week} — ${bestWeekEntry.result.votes} vote
          </div>
        </div>
      `
      );
    }

    container.insertAdjacentHTML(
      "beforeend",
      `
      <div class="liga-highlight-card">
        <div class="liga-highlight-title">Total Votes This Season</div>
        <div class="liga-highlight-main">${totalVotesSeason}</div>
        <div class="liga-highlight-sub">All members combined</div>
      </div>
    `
    );
  }

//Season Bar Progress
  function renderSeasonProgress(playedWeeks, plannedWeeks) {
    const el = getEl("ligaSeasonProgress");
    if (!el) return;

    const total = plannedWeeks || playedWeeks || 1;
    const pct = Math.max(
      0,
      Math.min(100, Math.round((playedWeeks / total) * 100))
    );

    el.innerHTML = `
      <div class="liga-progress-top">
        <span>Season Progress</span>
        <span>${playedWeeks} / ${total} weeks</span>
      </div>
      <div class="liga-progress-bar">
        <div class="liga-progress-fill" style="width:${pct}%"></div>
      </div>
    `;
  }

//Countdown Next Matchday
  function renderNextMatchCountdown() {
    const el = getEl("ligaNextMatch");
    if (!el) return;

    const hasWeeks = (data.weeks || []).length > 0;

    // Season belum dimulai → TBA
    if (!hasWeeks) {
      el.innerHTML = `
        <span class="liga-next-label">Next Matchday</span>
        <span class="liga-next-date">To be announced</span>
      `;
      if (countdownTimerId) clearInterval(countdownTimerId);
      return;
    }

    function update() {
      const now = new Date();
      const next = getNextThursday(now);
      const diffMs = next - now;

      if (diffMs <= 0) {
        el.innerHTML = `
          <span class="liga-next-label">Next Matchday</span>
          <span class="liga-next-live">Matchday is live today!</span>
        `;
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const d = Math.floor(totalSec / 86400);
      const h = Math.floor((totalSec % 86400) / 3600);
      const m = Math.floor((totalSec % 3600) / 60);

      const dateLabel = next.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      el.innerHTML = `
        <span class="liga-next-label">Next Matchday</span>
        <span class="liga-next-date">${dateLabel}</span>
        <span class="liga-next-count">${d}d ${h}h ${m}m</span>
      `;
    }

    if (countdownTimerId) clearInterval(countdownTimerId);
    update();
    countdownTimerId = setInterval(update, 60000);
  }

  // helper kecil kalau belum ada
  const qs  = (s) => document.querySelector(s);

    function initLigaVoteStatus() {
    const wrap   = qs('#ligaVoteStatus');
    const textEl = qs('#ligaVoteStatusText');
    const liveEl = qs('#ligaVoteStatusLive');
    const timeEl = qs('#ligaVoteStatusTime');
    const cdEl   = qs('#ligaVoteCountdown');

    if (!wrap || !textEl || !timeEl) return;

    const now = new Date();
    const day = now.getDay(); // 0=Min, 1=Sen, ... 4=Kam, 5=Jum, 6=Sab

    const pad = (n) => String(n).padStart(2, '0');
    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    timeEl.textContent = `Terakhir update: ${hh}.${mm} WIB`;

    let statusText = '';
    let showLive = false;

    // default: kosongkan countdown
    if (cdEl) cdEl.textContent = '';

    if (day === 4) {
      // KAMIS → cek sisa waktu sampai 23:59
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diffMs = end - now;

      if (diffMs > 0) {
        showLive = true;
        statusText = 'Voting sedang berlangsung.';

        if (cdEl) {
          const totalSec = Math.floor(diffMs / 1000);
          const h = Math.floor(totalSec / 3600);
          const m = Math.floor((totalSec % 3600) / 60);
          cdEl.textContent = `• Sisa waktu: ${h}j ${m}m`;
        }
      } else {
        // sudah lewat jam 23:59 → anggap selesai
        statusText =
          'Vote minggu ini sudah selesai. Rekap akan diupdate di halaman liga.';
      }
    } else if (day === 5 || day === 6) {
      // JUMAT / SABTU
      statusText =
        'Vote minggu ini sudah selesai. Rekap akan diupdate di halaman liga.';
    } else if (day === 0) {
      // MINGGU
      statusText = 'Voting minggu depan masih dalam persiapan.';
    } else {
      // SENIN–RABU
      statusText = 'Voting minggu ini akan berlangsung hari Kamis.';
    }

    textEl.textContent = statusText;

    if (liveEl) {
      liveEl.style.display = showLive ? 'inline-flex' : 'none';
    }
  }

  /* ==========================================
     6. INIT – jalan di DOMContentLoaded
  =========================================== */

  function setupWeekControls() {
    const filterContainer = getEl("ligaWeeksFilter");
    const sortSelect = getEl("ligaWeekSort");
    if (!filterContainer || !sortSelect) return;

    const members = data.members || [];
    const buttons = [
      { id: "all", label: "All" },
      ...members.map((m) => ({
        id: m.id,
        label: m.name.split(" ")[0], // nama depan aja biar pendek
      })),
    ];

    // Generate tombol filter
    filterContainer.innerHTML = buttons
      .map(
        (b) => `
        <button type="button"
          class="liga-chip liga-week-filter-btn ${
            b.id === "all" ? "active" : ""
          }"
          data-member="${b.id}">
          ${b.label}
        </button>
      `
      )
      .join("");

    // Event klik filter
    filterContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".liga-week-filter-btn");
      if (!btn) return;

      weekFilterMember = btn.dataset.member || "all";

      // toggle active
      [...filterContainer.querySelectorAll(".liga-week-filter-btn")].forEach(
        (b) => b.classList.toggle("active", b === btn)
      );

      renderWeeklyCards();
    });

    // Event sort
    sortSelect.addEventListener("change", () => {
      weekSortMode = sortSelect.value;
      renderWeeklyCards();
    });
  }

    document.addEventListener("DOMContentLoaded", () => {
      const seasonShell = getEl("ligaSeason");
      const totalWeeks = (data.weeks || []).length;

      // --- Vote Kamisan Status ---
      if (document.querySelector('#ligaVoteStatus')) {
        initLigaVoteStatus();
      }
      
      /* =========================
         THEME TOGGLE KHUSUS LIGA
         (pakai dt-theme global)
      ========================== */
      const ligaThemeBtn = document.getElementById("ligaThemeToggle");
      if (ligaThemeBtn && typeof applyTheme === "function") {
        // sync icon dengan tema tersimpan
        const saved = localStorage.getItem("dt-theme") || "light";
        ligaThemeBtn.textContent = saved === "dark" ? "☀️" : "🌙";

        ligaThemeBtn.addEventListener("click", () => {
          const nowDark = document.body.classList.contains("dark");
          const newTheme = nowDark ? "light" : "dark";
          applyTheme(newTheme);
          localStorage.setItem("dt-theme", newTheme);
          ligaThemeBtn.textContent = newTheme === "dark" ? "☀️" : "🌙";
        });
      }

      /* =========================
         SEASON SHELL (liga.html)
      ========================== */
      if (seasonShell) {
        const titleEl = getEl("ligaSeasonTitle");
        const subEl = getEl("ligaSeasonSubtitle");

        if (titleEl && data.label) {
          titleEl.textContent = `DTSL — ${data.label}`;
        }

        if (subEl) {
          subEl.textContent =
            `Poin: Juara 1 = 5 pts, Juara 2 = 3 pts, Juara 3 = 1 pt — ` +
            `Total minggu: ${totalWeeks}`;
        }

        // season switch + notice
        renderSeasonSwitch();
        renderSeasonNotice(totalWeeks);

        const standings = buildSeasonStandings();
        renderSeasonTable(standings);

        // pakai plannedWeeks dari data
        renderSeasonProgress(totalWeeks, data.plannedWeeks || 12);
        renderNextMatchCountdown();

        renderLatestWeekPodium();
        setupWeekControls();
        renderWeeklyCards();
        renderHeadToHead();
        renderSeasonHighlights(standings);
      }

      /* =========================
         DETAIL WEEK (liga-week.html)
      ========================== */
      renderWeekDetailPage();
    });


})();

/* =====================================
   DTSL – Podium animation helper
   (naik podium + delay 1–2–3)
===================================== */
(function () {
  function animatePodiumSlots() {
    var wrapper = document.querySelector(".liga-podium-123 .podium-wrapper");
    if (!wrapper) return;

    var slots = wrapper.querySelectorAll(".podium");
    if (!slots.length) return;

    // reset dulu supaya kalau di-render ulang, animasinya bisa jalan lagi
    slots.forEach(function (slot) {
      slot.classList.remove("podium-enter");
    });

    // kasih delay kecil biar naik satu-satu
    slots.forEach(function (slot, index) {
      setTimeout(function () {
        slot.classList.add("podium-enter");
      }, 120 * index);
    });
  }

  // 1) jalan pas DOM sudah siap
  document.addEventListener("DOMContentLoaded", function () {
    animatePodiumSlots();
  });

  // 2) kalau konten podium di-update lewat JS lama,
  //    kita observe perubahan di dalam .liga-podium-123
  var host = document.querySelector(".liga-podium-123");
  if (host && "MutationObserver" in window) {
    var obs = new MutationObserver(function () {
      animatePodiumSlots();
    });
    obs.observe(host, { childList: true, subtree: true });
  }
})();
