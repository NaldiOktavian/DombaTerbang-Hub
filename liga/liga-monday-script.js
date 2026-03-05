// ===== Part 1/6: boot, theme sync, pickSeason, data & member index =====
/* liga-monday-script.part1.js */

(function () {
  // gunakan LIGA_MONDAY_SEASONS (pastikan liga-monday-data.js ter-load)
  const seasons = window.LIGA_MONDAY_SEASONS || [];
  if (!seasons.length) {
    console.error("LIGA_MONDAY_SEASONS tidak ditemukan. Pastikan liga-monday-data.js sudah ter-load.");
    return;
  }

  function pickSeason() {
    const params = new URLSearchParams(window.location.search);
    const seasonId = params.get("season");
    const visibleSeasons = seasons.filter((s) => !s.hidden);
    const defaultSeason = visibleSeasons[0] || seasons[0];

    if (seasonId) {
      const found = seasons.find((s) => s.seasonId === seasonId && !s.hidden);
      if (found) return found;
    }
    return defaultSeason;
  }

  const data = pickSeason();

  function getEl(id) { return document.getElementById(id); }

  function buildMemberIndex(members) {
    const map = {};
    (members || []).forEach((m) => { map[m.id] = m; });
    return map;
  }
  const memberIndex = buildMemberIndex(data.members || []);

  // state
  let weekFilterMember = "all";
  let weekSortMode = "newest";
  let countdownTimerId = null;

  // ===== Empty state message per member (Weekly Results) =====
  const emptyWeekMessages = {
    cynthia: {
      title: "Cynthia Yaputera belum pernah menjadi juara 🥲",
      subtitle: "Saatnya Cynthia unjuk gigi! Gas vote yang kenceng di matchday berikutnya yaaa ✨",
    },
    jemima: {
      title: "Jemima Evodie belum naik podium musim ini 👀",
      subtitle: "Potensi besar nih… tinggal nunggu momen ledaknya 🔥",
    },
    indah: {
      title: "Indah Cahya masih nunggu momen emasnya 🌟",
      subtitle: "Sedikit lagi… jangan berhenti dukung Indah ya!",
    },
    ribka: {
      title: "Ribka Budiman belum dapet giliran juara 😌",
      subtitle: "Pelan-pelan tapi pasti. Support terus yaa 💛",
    },
    nala: {
      title: "Ya allah lindungi bilqis, Ya Allah sayangi Bilqis💙🦁",
      subtitle: "Bilqis pasti akan podium. mohon dukungannya untuk Bilqis selalu yaa💙",
    },
    intan: {
      title: "Intan masih belum podium nih :(",
      subtitle: "Yuk dukung intan lagi yuk.. Intan butuh dukungan kalian🔥",
    },
    anin: {
      title: "Anin belum dapet giliran podium nih ",
      subtitle: "Tenang anin butuh waktu untuk bersinar. Support anin terus yaa 🥭",
    },
    delynn: {
      title: "Noooo Delynn belum pernah podium😭",
      subtitle: "Ayook vote delynn. terus dukung delynn yaa kaa🤩",
    },
    default: {
      title: "Belum ada kemenangan di filter ini 📭",
      subtitle: "Coba ganti filter atau tunggu matchday berikutnya ✨",
    }
  };

  // ===== Part 2/6: helpers (sorting, next match date, sortResults) =====
/* liga-monday-script.part2.js */

  function getNextMonday(baseDate) {
    const d = new Date(baseDate);
    const day = d.getDay(); // 0=Sun,1=Mon...
    const target = 1; // Monday
    let diff = target - day;
    if (diff <= 0) diff += 7;
    d.setDate(d.getDate() + diff);
    d.setHours(20, 0, 0, 0); // match at 20:00 example
    return d;
  }

  function sortWeeksAsc(weeks) { return [...(weeks || [])].sort((a,b) => a.week - b.week); }
  function sortWeeksDesc(weeks) { return [...(weeks || [])].sort((a,b) => b.week - a.week); }

  function sortResultsForPodium(results) {
    return [...(results || [])].sort((a,b) => {
      const pa = a.points || 0, pb = b.points || 0;
      if (pb !== pa) return pb - pa;
      const va = a.votes || 0, vb = b.votes || 0;
      if (vb !== va) return vb - va;
      return String(a.memberId).localeCompare(String(b.memberId));
    });
  }
  // ===== computeResultsWithPoints =====
// Ambil week object -> kembalikan results yang sudah tersort & sudah diberi points otomatis.
// Tie-break khusus: jika week.week === 1 -> tie by full name (A..Z, case-insensitive).
function computeResultsWithPoints(week) {
  const weekNum = Number(week && week.week) || null;
  const raw = (week && week.results) ? (week.results || []) : [];
  // normalisasi minimal: pastikan setiap item punya memberId + votes number
  const items = raw.map(r => ({
    memberId: r.memberId,
    votes: Number(r.votes || 0)
  }));

  items.sort((a, b) => {
    if (b.votes !== a.votes) return b.votes - a.votes;

    // tie pada votes -> khusus matchday 1 gunakan nama lengkap (A..Z)
    if (weekNum === 1) {
      const na = (memberIndex[a.memberId]?.name || "").toLowerCase();
      const nb = (memberIndex[b.memberId]?.name || "").toLowerCase();
      if (na !== nb) return na.localeCompare(nb);
    }

    // deterministic fallback: urut by memberId
    return String(a.memberId).localeCompare(String(b.memberId));
  });

  // assign points top3: 5,3,1
  return items.map((it, idx) => ({
    memberId: it.memberId,
    votes: it.votes,
    points: idx === 0 ? 5 : idx === 1 ? 3 : idx === 2 ? 1 : 0
  }));
}

  // ===== Part 3/6: buildSeasonStandings + renderSeasonTable + renderFormDots =====
/* liga-monday-script.part3.js */

  function buildSeasonStandings() {
    const statsMap = {};
    (data.members || []).forEach((m) => {
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
        form: [] // pushes points per week (older -> newer)
      };
    });

    const weeksAsc = sortWeeksAsc(data.weeks || []);
    weeksAsc.forEach((week) => {
      computeResultsWithPoints(week).forEach((r) => {
        const s = statsMap[r.memberId];
        if (!s) return;
        s.weeksPlayed = s.form.length;
        s.totalPoints += r.points || 0;
        s.totalVotes += r.votes || 0;
        s.form.push(r.points || 0);
        if (r.points === 5) s.first += 1;
        else if (r.points === 3) s.second += 1;
        else if (r.points === 1) s.third += 1;
      });
    });

    function compareStandings(a,b) {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.totalVotes !== a.totalVotes) return b.totalVotes - a.totalVotes;
      return a.name.localeCompare(b.name);
    }

    const list = Object.values(statsMap);

    // compute previous ranks for trend
    const prevRankMap = {};
    if (weeksAsc.length > 1) {
      const prevStats = {};
      (data.members || []).forEach((m) => {
        prevStats[m.id] = { id: m.id, name: m.name, avatar: m.avatar, gen: m.gen, totalPoints: 0, totalVotes: 0 };
      });
        const weeksPrev = weeksAsc.slice(0, weeksAsc.length - 1);
        weeksPrev.forEach((week) => {
        const comp = computeResultsWithPoints(week);
        comp.forEach((r) => {
            const s = prevStats[r.memberId];
            if (!s) return;
            s.totalPoints += r.points || 0;
            s.totalVotes += r.votes || 0;
        });
    });
      const prevList = Object.values(prevStats).sort(compareStandings);
      prevList.forEach((s, idx) => { prevRankMap[s.id] = idx + 1; });
    }

    list.sort(compareStandings);
    list.forEach((s, idx) => {
      const currentRank = idx + 1;
      const prevRank = prevRankMap[s.id];
      s.rank = currentRank;
      if (!prevRank) s.trend = "new";
      else if (prevRank > currentRank) s.trend = "up";
      else if (prevRank < currentRank) s.trend = "down";
      else s.trend = "same";
    });

    return list;
  }

  function renderFormDots(formArr) {
    if (!formArr || !formArr.length) return "";
    // show last 5 (newest first)
    const last5 = formArr.slice(-5).reverse();
    const padded = [...last5];
    while (padded.length < 5) padded.push(0);
    return padded.map((value) => {
      if (value === 5) return `<span class="lg-form-dot lg-form-5">🥇</span>`;
      if (value === 3) return `<span class="lg-form-dot lg-form-3">🥈</span>`;
      if (value === 1) return `<span class="lg-form-dot lg-form-1">🥉</span>`;
      return `<span class="lg-form-dot lg-form-0">•</span>`;
    }).join("");
  }

  function renderSeasonTable(standings) {
    const tbody = getEl("ligaSeasonTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    standings.forEach((s) => {
      const rank = s.rank || 0;
      const isChampion = rank === 1;
      let trendClass = "lg-trend-new", trendIcon = "★", trendLabel = "Pendatang baru";
      if (s.trend === "up") { trendClass = "lg-trend-up"; trendIcon = "↑"; trendLabel = "Naik posisi"; }
      else if (s.trend === "down") { trendClass = "lg-trend-down"; trendIcon = "↓"; trendLabel = "Turun posisi"; }
      else if (s.trend === "same") { trendClass = "lg-trend-same"; trendIcon = "•"; trendLabel = "Posisi tetap"; }

      const rowClass = isChampion ? "lg-row-champion" : "";

      tbody.insertAdjacentHTML("beforeend",
        `<tr class="${rowClass}">
          <td>
            <div class="lg-rank-cell">
              <span class="lg-rank-number">${rank}</span>
              <span class="lg-rank-trend ${trendClass}" title="${trendLabel}">${trendIcon}</span>
            </div>
          </td>
          <td>
            <div class="lg-member-info">
              <img src="${s.avatar}" alt="${s.name}" class="lg-member-avatar" />
              <div>
                <div class="lg-name">${s.name} ${isChampion?`<span class="lg-champion-badge"></span>`:``}</div>
                <div class="lg-sub">${s.gen||""}</div>
              </div>
            </div>
          </td>
          <td>${(data.weeks || []).length}</td>
          <td>${s.first}</td>
          <td>${s.second}</td>
          <td>${s.third}</td>
          <td>${s.totalVotes}</td>
          <td class="lg-points">${s.totalPoints}</td>
          <td class="lg-form">${renderFormDots(s.form)}</td>
        </tr>`
      );
    });
  }

  function renderWeekStandingsLikeSeason(week) {
    const wrap = document.querySelector(".week-standings-wrap");
    if (!wrap) return;

    const results = computeResultsWithPoints(week);

    wrap.innerHTML = `
      <table class="liga-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Member</th>
            <th>Votes</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          ${results.map((r, idx) => {
            const m = memberIndex[r.memberId] || {};
            const isChampion = idx === 0;

            return `
              <tr class="${isChampion ? "lg-row-champion" : ""}">
                <td class="lg-rank">
                  ${idx + 1}
                  ${idx === 0 ? `<span class="lg-week-winner-badge">Winner</span>` : ``}
                </td>
                <td>
                  <div class="lg-member-info">
                    <img src="${m.avatar}" class="lg-member-avatar" />
                    <div>
                      <div class="lg-name">${m.name}</div>
                      <div class="lg-sub">${m.gen || ""}</div>
                    </div>
                  </div>
                </td>

                <td class="lg-vote">
                  🗳️ ${r.votes} votes
                </td>

                <td class="lg-points">
                  🏆 ${r.points} pts
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  }

  // ===== Part 4/6: renderLatestWeekPodium + renderWeeklyCards =====
/* liga-monday-script.part4.js */

  function renderLatestWeekPodium() {
    const podiumEl = getEl("ligaCurrentPodium");
    if (!podiumEl) return;

    const weeks = data.weeks || [];
    if (!weeks.length) {
      podiumEl.innerHTML = `<p class="liga-sub">Belum ada hasil minggu terakhir.</p>`;
      return;
    }

    const latest = weeks.sort((a,b) => b.week - a.week)[0];
    const results = computeResultsWithPoints(latest).slice(0, 3);

    const podium = results.map((r, idx) => {
      const m = memberIndex[r.memberId] || {};
      return {
        rank: idx + 1,
        name: m.name,
        nickname: (m.name || "").split("")[0],
        avatar: m.avatar,
        podiumImage: m.podiumImage, // ⬅️ PENTING
        votes: r.votes,
        points: r.points
      };
    });

    // urutan visual: 2 - 1 - 3
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
      // Mobile  : 1 - 2 - 3 (stack)
      // Desktop : 2 - 1 - 3 (juara 1 di tengah, F1 style)
      const order = isMobile ? [1, 2, 3] : [2, 1, 3];

    podiumEl.innerHTML = `
      <div class="mpl-podium">
        ${order.map(rank => {
          const p = podium.find(x => x.rank === rank);
          if (!p) return "";
          return `
            <div class="mpl-bar rank-${rank}">
              <img class="mpl-avatar" src="${p.podiumImage || p.avatar}" alt="${p.name}">
              <div class="mpl-content">
                <div class="mpl-sub">${p.name.split(" ")[0]}</div>
                <div class="mpl-name">${p.name.split(" ")[1] || p.name}</div>
              </div>
              <div class="mpl-score">
                <strong>${p.points} pts</strong>
                <span>${p.votes} vote</span>
              </div>
              <div class="mpl-rank">${rank}</div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderWeeklyCards() {
    const container = getEl("ligaWeeks");
    if (!container) return;
    let weeksList = [...(data.weeks || [])];

    if (weekFilterMember !== "all") {
     weeksList = weeksList.filter((week) => {
            const sorted = computeResultsWithPoints(week);
            const top = sorted[0];
            return top && top.memberId === weekFilterMember;
        });
    }

      // default: TERBARU DULU
      weeksList.sort((a, b) => b.week - a.week);

      // sort override
      if (weekSortMode === "oldest") {
        weeksList.sort((a, b) => a.week - b.week);
      } 
      else if (weekSortMode === "votes") {
        weeksList.sort((a, b) => {
          const maxA = Math.max(...computeResultsWithPoints(a).map(r => r.votes || 0), 0);
          const maxB = Math.max(...computeResultsWithPoints(b).map(r => r.votes || 0), 0);
          return maxB - maxA;
        });
      }

    container.innerHTML = "";
    if (weeksList.length === 0) {
      const member = memberIndex[weekFilterMember];
      const msg =
        emptyWeekMessages[weekFilterMember] ||
        emptyWeekMessages.default;

      container.innerHTML = `
        <div class="lg-week-card lg-week-empty">
          <div class="lg-week-header">
            <span class="lg-week-label">No Result</span>
          </div>

          <div class="lg-week-body">
            <div class="lg-week-winner">
              ${
                member?.avatar
                  ? `<div class="lg-week-avatar"
                      style="background-image:url('${member.avatar}')"></div>`
                  : ""
              }

              <div>
                <div class="lg-week-name">
                  ${msg.title}
                </div>
                <div class="lg-week-meta">
                  ${msg.subtitle}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    weeksList.forEach((week) => {
      const resultsSorted = computeResultsWithPoints(week);
      if (!resultsSorted.length) return;
      const top = resultsSorted[0];
      const member = memberIndex[top.memberId] || {};
      container.insertAdjacentHTML("beforeend",
        `<a class="lg-week-card" href="liga-monday-week.html?week=${encodeURIComponent(week.week)}">
          <div class="lg-week-header">
            <span class="lg-week-label">Minggu ${week.week}</span>
            <span class="lg-week-date">${week.label}</span>
          </div>
          <div class="lg-week-body">
            <div class="lg-week-winner">
              <div class="lg-week-avatar" style="background-image:url('${week.winnerPhoto}')"></div>
              <div>
                <div class="lg-week-name">${member.name || top.memberId}</div>
                <div class="lg-week-meta">${top.votes} vote • ${top.points} pts</div>
              </div>
            </div>
            <div class="lg-week-cta">Lihat detail →</div>
          </div>
        </a>`
      );
    });
  }
  // ===== Part 5/6: head-to-head + week detail renderer =====
/* liga-monday-script.part5.js */

  function buildHeadToHead() {
    const members = (data.members || []).map((m) => m.id);
    const stats = {};
    const weeks = data.weeks || [];

    weeks.forEach((week) => {
      const sorted = computeResultsWithPoints(week);
      const rankMap = {};
      sorted.forEach((r, idx) => { rankMap[r.memberId] = idx; });

      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const a = members[i], b = members[j], key = `${a}|${b}`;
          if (!stats[key]) stats[key] = { aId: a, bId: b, aWins: 0, bWins: 0, total: 0 };
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
      const a = memberIndex[p.aId] || {}, b = memberIndex[p.bId] || {};
      const aName = a.name || p.aId, bName = b.name || p.bId;
      let summary = "";
      if (p.aWins === p.bWins) summary = `Imbang ${p.aWins} – ${p.bWins} dari ${p.total} minggu.`;
      else if (p.aWins > p.bWins) summary = `${aName} unggul ${p.aWins} – ${p.bWins} dari ${p.total} minggu.`;
      else summary = `${bName} unggul ${p.bWins} – ${p.aWins} dari ${p.total} minggu.`;

      container.insertAdjacentHTML("beforeend",
        `<div class="liga-h2h-card">
          <div class="liga-h2h-names">
            <span>${aName}</span>
            <span class="liga-h2h-score">${p.aWins} – ${p.bWins}</span>
            <span>${bName}</span>
          </div>
          <div class="liga-h2h-sub">${summary}</div>
        </div>`
      );
    });
  }

  // WEEK DETAIL helpers
  function findWeekByQuery() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("week");
    if (!id) return null;
    const weekNum = Number(id);
    if (!Number.isFinite(weekNum)) return null;
    return (data.weeks || []).find((w) => w.week === weekNum) || null;
  }

  function buildWeekPodium(week) {
    const sorted = computeResultsWithPoints(week);
    return sorted.slice(0, 3).map((r) => {
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
  }

    function renderWeekStandingsCompact(week) {
    const wrap = document.querySelector(".week-standings-wrap");
    if (!wrap) return;

    const results = computeResultsWithPoints(week);
    wrap.innerHTML = "";

    results.forEach((r, idx) => {
      const m = memberIndex[r.memberId] || {};
      const isWinner = idx === 0;

      wrap.insertAdjacentHTML("beforeend", `
        <div class="week-standings-row ${isWinner ? "is-winner" : ""}">
          <div class="ws-rank">${idx + 1}</div>

          <div class="ws-member">
            <img src="${m.avatar}" class="ws-avatar" alt="${m.name}">
            <div class="ws-info">
              <div class="ws-name">${m.name}</div>
              <div class="ws-gen">${m.gen || ""}</div>
            </div>
          </div>

          <div class="ws-metrics">
            <div class="ws-votes">
              <span class="ws-num">${r.votes}</span>
              <span class="ws-label">votes</span>
            </div>
            <div class="ws-points">
              <span class="ws-num">${r.points}</span>
              <span class="ws-label">pts</span>
            </div>
          </div>
        </div>
      `);
    });
  }

  function renderWeekDetailPage() {
    const titleEl = getEl("week-title");
    if (!titleEl) return; // not on week page
    const week = findWeekByQuery();
    if (!week) { titleEl.textContent = "Minggu tidak ditemukan"; return; }
    const podium = buildWeekPodium(week);
    const winner = podium[0];
    const caption = week.winnerCaption && week.winnerCaption.trim().length
      ? week.winnerCaption
      : winner ? memberIndex[winner.id]?.hashtag || "#DombaTerbangLiga" : "";

    titleEl.textContent = `Minggu ${week.week} — ${week.label}`;

    const photoEl = getEl("week-photo");
    if (photoEl) {
      photoEl.innerHTML = `
        <div class="winner-frame">
          <div class="winner-frame-title">🏆 Juara 1 – Week ${week.week}</div>
          <img src="${week.winnerPhoto}" alt="Winner Photo" />
        </div>
      `;
    }

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
          <div class="winner-caption">${caption}</div>
          ${ week.winnerSource ? `<a href="${week.winnerSource}" class="liga-caption-link" target="_blank" rel="noopener">Lihat Post Asli ↗</a>` : "" }
        </div>
      `;
    }

    const podiumEl = getEl("week-podium");
    if (podiumEl && podium.length) {
      const rowsHtml = podium.map((p, idx) => {
        const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";
        const label = idx === 0 ? "Juara 1" : idx === 1 ? "Juara 2" : "Juara 3";
        const rowClass = idx === 0 ? "liga-week-podium-row rank-1" : idx === 1 ? "liga-week-podium-row rank-2" : "liga-week-podium-row rank-3";
        return `
          <div class="${rowClass}">
            <div class="liga-week-podium-medal">
              <span class="liga-week-podium-medal-icon">${medal}</span>
              <span>${label}</span>
            </div>
            <div class="liga-week-podium-main">
              ${ p.avatar ? `<img src="${p.avatar}" alt="${p.name}" class="liga-week-podium-avatar" />` : "" }
              <div class="liga-week-podium-info">
                <div class="liga-week-podium-name">${p.name}</div>
                <div class="liga-week-podium-meta">${p.votes} vote • ${p.points} pts</div>
              </div>
            </div>
          </div>
        `;
      }).join("");
      podiumEl.innerHTML = `<div class="liga-week-podium-list">${rowsHtml}</div>`;
    }

    renderWeekStandingsCompact(week);

    // === MATCHDAY SUMMARY ===
    const summaryEl = document.getElementById("week-summary");
    if (summaryEl) {
      const results = computeResultsWithPoints(week);
      const totalVotes = results.reduce((s, r) => s + (r.votes || 0), 0);
      const winner = results[0];
      const runnerUp = results[1];
      const third = results[2];

      summaryEl.innerHTML = `
        <div class="week-summary-card">
          <div class="week-summary-title">Total Vote</div>
          <div class="week-summary-main">${totalVotes}</div>
          <div class="week-summary-sub">Vote minggu ini</div>
        </div>

        ${winner ? `
        <div class="week-summary-card">
          <div class="week-summary-title">Pemenang</div>
          <div class="week-summary-main">${memberIndex[winner.memberId]?.name}</div>
          <div class="week-summary-sub">${winner.votes} vote • ${winner.points} pts</div>
        </div>` : ``}

        <div class="week-summary-card">
          <div class="week-summary-title">Peserta</div>
          <div class="week-summary-main">${results.length}</div>
          <div class="week-summary-sub">Member berpartisipasi</div>
        </div>
      `;
    }
  }
  // ===== Part 6/6: highlights, progress, countdown, vote status, controls, init, podium animation =====
/* liga-monday-script.part6.js */

  function renderSeasonHighlights(standings) {
    const container = getEl("ligaHighlights");
    if (!container || !standings || !standings.length) return;
    const weeks = data.weeks || [];

    const mostWins = [...standings].sort((a,b) => b.first - a.first || b.totalPoints - a.totalPoints)[0];

    let bestWeekEntry = null;
    weeks.forEach((week) => {
        (computeResultsWithPoints(week) || []).forEach((r) => {
            if (!bestWeekEntry || (r.votes || 0) > bestWeekEntry.result.votes) {
            bestWeekEntry = { week, result: r };
            }
        });
    });

    const bestMember = bestWeekEntry ? memberIndex[bestWeekEntry.result.memberId] || null : null;
    const totalVotesSeason = standings.reduce((sum, s) => sum + (s.totalVotes || 0), 0);

    container.innerHTML = "";
    if (mostWins) {
      container.insertAdjacentHTML("beforeend",
        `<div class="liga-highlight-card" data-icon="🏆">
          <div class="liga-highlight-title">Most Wins</div>
          <div class="liga-highlight-main">${mostWins.name}</div>
          <div class="liga-highlight-sub">Wins × ${mostWins.first}</div>
        </div>`
      );
    }
    if (bestWeekEntry && bestMember) {
      container.insertAdjacentHTML("beforeend",
        `<div class="liga-highlight-card">
          <div class="liga-highlight-title">Highest Votes in a Week</div>
          <div class="liga-highlight-main">${bestMember.name}</div>
          <div class="liga-highlight-sub">Week ${bestWeekEntry.week.week} — ${bestWeekEntry.result.votes} vote</div>
        </div>`
      );
    }
    container.insertAdjacentHTML("beforeend",
      `<div class="liga-highlight-card">
        <div class="liga-highlight-title">Total Votes This Season</div>
        <div class="liga-highlight-main">${totalVotesSeason}</div>
        <div class="liga-highlight-sub">All members combined</div>
      </div>`
    );
  }

  function renderSeasonProgress(playedWeeks, plannedWeeks) {
    const labelEl = getEl("ligaProgressLabel");
    const percentEl = getEl("ligaProgressPercent");
    const fillEl = getEl("ligaProgressFill");

    if (!labelEl || !percentEl || !fillEl) return;

    const played = Number(playedWeeks) || 0;
    const total = Number(plannedWeeks) || played || 1;
    const pct = Math.round((played / total) * 100);

    labelEl.textContent = `Matchday ${played}`;
    percentEl.textContent = `${pct}% Season`;

    // animasi halus
    requestAnimationFrame(() => {
      fillEl.style.width = pct + "%";
    });
  }

  function renderNextMatchCountdown() {
    const dateEl = getEl("ligaNextMatchDate");
    const countEl = getEl("ligaNextMatchCountdown");

    if (!dateEl || !countEl) return;

    const totalWeeks = (data.weeks || []).length;
    const planned = data.plannedWeeks || totalWeeks;

    // kalau belum ada match sama sekali
    if (totalWeeks === 0) {
      dateEl.textContent = "–";
      countEl.textContent = "TBA";
      return;
    }

    const nextMatchday = totalWeeks + 1;

    // kalau season selesai
    if (nextMatchday > planned) {
      dateEl.textContent = "Season selesai";
      countEl.textContent = "🎉";
      return;
    }

    const next = getNextMonday(new Date());
    const dateLabel = next.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    dateEl.textContent = `Matchday ${nextMatchday} — ${dateLabel}`;
    countEl.textContent = "Upcoming";
  }

  // vote status (adapted to Monday)
  const qs = (s) => document.querySelector(s);
  function initLigaVoteStatus() {
    const wrap = qs('#ligaVoteStatus');
    const textEl = qs('#ligaVoteStatusText');
    const liveEl = qs('#ligaVoteStatusLive');
    const timeEl = qs('#ligaVoteStatusTime');
    const cdEl = qs('#ligaVoteCountdown');
    if (!wrap || !textEl || !timeEl) return;
    const now = new Date();
    const day = now.getDay();
    const pad = (n) => String(n).padStart(2, '0');
    const hh = pad(now.getHours()), mm = pad(now.getMinutes());
    timeEl.textContent = `Terakhir update: ${hh}.${mm} WIB`;
    let statusText = '', showLive = false;
    if (day === 1) {
      const end = new Date(now); end.setHours(23,59,59,999); const diffMs = end - now;
      if (diffMs > 0) {
        showLive = true; statusText = 'Voting sedang berlangsung.';
        if (cdEl) { const totalSec = Math.floor(diffMs/1000); const h = Math.floor(totalSec/3600); const m = Math.floor((totalSec%3600)/60); cdEl.textContent = `• Sisa waktu: ${h}j ${m}m`; }
      } else statusText = 'Vote minggu ini sudah selesai. Rekap akan diupdate di halaman liga.';
    } else if (day === 2 || day === 3) {
      statusText = 'Vote minggu ini sudah selesai. Rekap akan diupdate di halaman liga.';
    } else if (day === 0) statusText = 'Voting minggu depan masih dalam persiapan.';
    else statusText = 'Voting minggu ini akan berlangsung hari Senin.';
    textEl.textContent = statusText;
    if (liveEl) liveEl.style.display = showLive ? 'inline-flex' : 'none';
  }

  // setup controls (filters + sort)
  function setupWeekControls() {
    const filterContainer = getEl("ligaWeeksFilter");
    const sortSelect = getEl("ligaWeekSort");
    if (!filterContainer || !sortSelect) return;
    const members = data.members || [];
    const buttons = [{ id: "all", label: "All" }, ...members.map((m) => ({ id: m.id, label: m.name.split(" ")[0] }))];
    filterContainer.innerHTML = buttons.map((b) => `
      <button type="button" class="liga-chip liga-week-filter-btn ${b.id === "all" ? "active" : ""}" data-member="${b.id}">
        ${b.label}
      </button>
    `).join("");
    filterContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".liga-week-filter-btn");
      if (!btn) return;
      weekFilterMember = btn.dataset.member || "all";
      [...filterContainer.querySelectorAll(".liga-week-filter-btn")].forEach((b) => b.classList.toggle("active", b === btn));
      renderWeeklyCards();
    });
    sortSelect.addEventListener("change", () => { weekSortMode = sortSelect.value; renderWeeklyCards(); });
  }

  // ---- helper: renderSeasonSwitch & renderSeasonNotice ----
  function renderSeasonSwitch() {
    const el = getEl("ligaSeasonSwitch");
    if (!el) return;

    const visibleSeasons = (seasons || []).filter((s) => !s.hidden);
    if (!visibleSeasons || visibleSeasons.length <= 1) {
      el.style.display = "none";
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const currentId = params.get("season") || (visibleSeasons[0] && visibleSeasons[0].seasonId);

    el.innerHTML =
      `<div class="liga-season-label">Season</div>` +
      visibleSeasons
        .map((s) => {
          const active = s.seasonId === currentId;
          const label = s.label || s.seasonId;
          const href = `?season=${encodeURIComponent(s.seasonId)}`;
          return `
            <a href="${href}" class="liga-season-pill ${active ? "active" : ""}">
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

  // INIT
  document.addEventListener("DOMContentLoaded", () => {
    const seasonShell = getEl("ligaSeason");
    const totalWeeks = (data.weeks || []).length;

    if (document.querySelector('#ligaVoteStatus')) initLigaVoteStatus();
    if (seasonShell) {
      const titleEl = getEl("ligaSeasonTitle");
      const subEl = getEl("ligaSeasonSubtitle");
      if (titleEl && data.label) titleEl.textContent = `DTSL — ${data.label}`;
      if (subEl) subEl.textContent = `Poin: Juara 1 = 5 pts, Juara 2 = 3 pts, Juara 3 = 1 pt — Total minggu: ${totalWeeks}`;

      renderSeasonSwitch();
      renderSeasonNotice(totalWeeks);

      const standings = buildSeasonStandings();
      renderSeasonTable(standings);
      renderSeasonProgress(totalWeeks, data.plannedWeeks || totalWeeks);
      renderNextMatchCountdown();
      renderLatestWeekPodium();
      setupWeekControls();
      renderWeeklyCards();
      renderHeadToHead();
      renderSeasonHighlights(standings);
    }

    renderWeekDetailPage();
  });

  // Podium animation helper
  (function () {
    function animatePodiumSlots() {
      var wrapper = document.querySelector(".liga-podium-123 .podium-wrapper");
      if (!wrapper) return;
      var slots = wrapper.querySelectorAll(".podium");
      if (!slots.length) return;
      slots.forEach(function (slot) { slot.classList.remove("podium-enter"); });
      slots.forEach(function (slot, index) {
        setTimeout(function () { slot.classList.add("podium-enter"); }, 120 * index);
      });
    }
    document.addEventListener("DOMContentLoaded", function () { animatePodiumSlots(); });
    var host = document.querySelector(".liga-podium-123");
    if (host && "MutationObserver" in window) {
      var obs = new MutationObserver(function () { animatePodiumSlots(); });
      obs.observe(host, { childList: true, subtree: true });
    }
  })();

  // ===============================
  // MONDAY THEME TOGGLE — FINAL
  // ===============================
  (function initMondayTheme() {
    const btn = document.getElementById("ligaThemeToggle");
    if (!btn) return;

    function applyTheme(theme) {
      const isDark = theme === "dark";
      document.body.classList.toggle("dark", isDark);
      localStorage.setItem("dt-theme", theme);
      btn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    }

    // init on load
    const savedTheme = localStorage.getItem("dt-theme") || "light";
    applyTheme(savedTheme);

    // toggle on click
    btn.addEventListener("click", () => {
      const nowDark = document.body.classList.contains("dark");
      applyTheme(nowDark ? "light" : "dark");
    });
  })();

})(); // end outer IIFE