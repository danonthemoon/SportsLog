// app.js - Multi-Sport Application Controller (NBA, MLB, Soccer)
const app = {
  rawBundle: null,
  currentSport: 'nba', // 'nba', 'mlb', 'soccer'
  data: null,
  activeTab: 'games',
  teamColors: {},

  sportMeta: {
    nba: { icon: '🏀', title: 'NBA Live Experience', label: 'NBA' },
    mlb: { icon: '⚾', title: 'MLB Ballpark Journey', label: 'MLB' },
    soccer: { icon: '⚽', title: 'Global Football Experience', label: 'Soccer' }
  },

  async init() {
    try {
      const response = await fetch('./data.json');
      const rawText = await response.text();
      this.rawBundle = JSON.parse(rawText.replace(/\bNaN\b/g, 'null').replace(/\bInfinity\b/g, 'null'));
      this.setSportData(this.currentSport);

      this.initTeamColors();
      this.renderKPIs();
      this.populateDropdowns();

      // Render default view
      gamesComponent.render();
      playersComponent.renderLeaderboard();
      playersComponent.renderAggregates();
      trophyComponent.render();
      recordsComponent.render();
    } catch (err) {
      console.error("Failed to load SportsLog data:", err);
      document.getElementById('kpi-container').innerHTML = `
        <div style="grid-column: 1/-1; padding: 2rem; background: rgba(244,63,94,0.15); border: 1px solid var(--accent-rose); border-radius: var(--radius-md); text-align: center;">
          <h3>⚠️ Unable to load application data</h3>
          <p>${err.message}</p>
        </div>
      `;
    }
  },

  setSportData(sport) {
    this.currentSport = sport;
    if (this.rawBundle && this.rawBundle[sport]) {
      this.data = this.rawBundle[sport];
    } else {
      this.data = this.rawBundle;
    }
  },

  switchSport(sport) {
    if (this.currentSport === sport && this.data) return;
    this.currentSport = sport;
    this.setSportData(sport);

    // Update active pill
    document.querySelectorAll('.sport-pill').forEach(btn => {
      btn.classList.toggle('active', btn.id === `sport-pill-${sport}`);
    });

    // Update brand
    const meta = this.sportMeta[sport] || this.sportMeta.nba;
    const brandIcon = document.querySelector('.brand-icon');
    if (brandIcon) brandIcon.textContent = meta.icon;
    const sportLabel = document.getElementById('current-sport-label');
    if (sportLabel) sportLabel.textContent = meta.title;

    this.initTeamColors();
    this.renderKPIs();
    this.populateDropdowns();
    trophyComponent.updateButtonLabels();
    playersComponent.renderPresets();

    // Re-render components
    gamesComponent.render();
    playersComponent.renderLeaderboard();
    playersComponent.renderAggregates();
    trophyComponent.render();
    recordsComponent.render();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  initTeamColors() {
    this.teamColors = {};
    if (this.data && this.data.trophy_teams) {
      this.data.trophy_teams.forEach(t => {
        if (typeof t === 'object' && t.abbrev) {
          this.teamColors[t.abbrev] = (t.colors && t.colors[0]) || '#38bdf8';
        }
      });
    }
  },

  getTeamColor(abbrev) {
    return this.teamColors[abbrev] || '#38bdf8';
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  },

  renderKPIs() {
    const s = this.data.summary;
    const container = document.getElementById('kpi-container');
    if (!container || !s) return;

    if (this.currentSport === 'nba') {
      container.innerHTML = `
        <div class="kpi-card clickable" onclick="app.setTab('games')" title="Click to view Games Log">
          <div class="kpi-label"><span>Games Attended</span><span>🏟️</span></div>
          <div class="kpi-value">${s.total_games}</div>
          <div class="kpi-subtext">Across 18 Distinct Arenas →</div>
        </div>
        <div class="kpi-card gold clickable" onclick="app.setTab('trophy'); trophyComponent.setView('teams')" title="Click to view Teams Quest">
          <div class="kpi-label"><span>NBA Teams Seen</span><span>🏀</span></div>
          <div class="kpi-value" style="color: var(--accent-gold);">${s.total_teams_seen} <span style="font-size: 1rem; color: var(--text-muted);">/ 30</span></div>
          <div class="kpi-subtext">${s.teams_completion_pct}% of League (View Quest →)</div>
        </div>
        <div class="kpi-card emerald clickable" onclick="app.setTab('trophy'); trophyComponent.setView('arenas')" title="Click to view Arenas Quest">
          <div class="kpi-label"><span>Active Arenas Visited</span><span>📍</span></div>
          <div class="kpi-value" style="color: var(--accent-emerald);">${s.total_active_arenas_seen} <span style="font-size: 1rem; color: var(--text-muted);">/ 30</span></div>
          <div class="kpi-subtext">+6 Historical & Neutral Venues →</div>
        </div>
        <div class="kpi-card purple">
          <div class="kpi-label"><span>Total Points Witnessed</span><span>🔥</span></div>
          <div class="kpi-value" style="color: var(--accent-purple);">${s.total_points_seen.toLocaleString()}</div>
          <div class="kpi-subtext">Avg ${s.avg_points_per_game} Points / Game</div>
        </div>
        <div class="kpi-card rose clickable" onclick="app.setTab('players')" title="Click to view Players Tracker">
          <div class="kpi-label"><span>Players Logged</span><span>👥</span></div>
          <div class="kpi-value" style="color: var(--accent-rose);">${s.total_players_seen}</div>
          <div class="kpi-subtext">${s.total_statlines} Individual Statlines →</div>
        </div>
      `;
    } else if (this.currentSport === 'mlb') {
      container.innerHTML = `
        <div class="kpi-card clickable" onclick="app.setTab('games')" title="Click to view MLB Games Log">
          <div class="kpi-label"><span>MLB Games Attended</span><span>⚾</span></div>
          <div class="kpi-value">${s.total_games}</div>
          <div class="kpi-subtext">From 2008 to 2026 (16 Seasons) →</div>
        </div>
        <div class="kpi-card gold clickable" onclick="app.setTab('trophy'); trophyComponent.setView('teams')" title="Click to view MLB Franchises Quest">
          <div class="kpi-label"><span>MLB Franchises Seen</span><span>🏆</span></div>
          <div class="kpi-value" style="color: var(--accent-gold);">${s.total_teams_seen} <span style="font-size: 1rem; color: var(--text-muted);">/ 30</span></div>
          <div class="kpi-subtext">${s.teams_completion_pct}% of Franchises (View Quest →)</div>
        </div>
        <div class="kpi-card emerald clickable" onclick="app.setTab('trophy'); trophyComponent.setView('arenas')" title="Click to view Park Chaser">
          <div class="kpi-label"><span>Ballparks Visited</span><span>🏟️</span></div>
          <div class="kpi-value" style="color: var(--accent-emerald);">${s.total_ballparks_visited}</div>
          <div class="kpi-subtext">Including Fenway, Wrigley & Petco →</div>
        </div>
        <div class="kpi-card purple">
          <div class="kpi-label"><span>Total Runs Witnessed</span><span>⚡</span></div>
          <div class="kpi-value" style="color: var(--accent-purple);">${s.total_runs_seen}</div>
          <div class="kpi-subtext">Avg ${s.avg_runs_per_game} Runs / Game</div>
        </div>
        <div class="kpi-card rose clickable" onclick="app.setTab('players')" title="Click to view Players Tracker">
          <div class="kpi-label"><span>Batters & Pitchers</span><span>👥</span></div>
          <div class="kpi-value" style="color: var(--accent-rose);">${s.total_batters_seen} <span style="font-size: 1rem; color: var(--text-muted);">/ ${s.total_pitchers_seen}</span></div>
          <div class="kpi-subtext">View All Players Logged →</div>
        </div>
      `;
    } else if (this.currentSport === 'soccer') {
      container.innerHTML = `
        <div class="kpi-card clickable" onclick="app.setTab('games')" title="Click to view Soccer Matches Log">
          <div class="kpi-label"><span>Matches Attended</span><span>⚽</span></div>
          <div class="kpi-value">${s.total_matches}</div>
          <div class="kpi-subtext">International, UEFA, Serie A & NWSL →</div>
        </div>
        <div class="kpi-card gold clickable" onclick="app.setTab('trophy'); trophyComponent.setView('teams')" title="Click to view Clubs & Nations Quest">
          <div class="kpi-label"><span>Clubs & Countries</span><span>🛡️</span></div>
          <div class="kpi-value" style="color: var(--accent-gold);">${s.total_teams}</div>
          <div class="kpi-subtext">Real Madrid, Juve, USMNT, Wave (View Quest →)</div>
        </div>
        <div class="kpi-card emerald clickable" onclick="app.setTab('trophy'); trophyComponent.setView('arenas')" title="Click to view Stadium Explorer Map">
          <div class="kpi-label"><span>Global Stadiums</span><span>🌍</span></div>
          <div class="kpi-value" style="color: var(--accent-emerald);">${s.total_stadiums}</div>
          <div class="kpi-subtext">Across 3 Continents & 10 Cities →</div>
        </div>
        <div class="kpi-card purple">
          <div class="kpi-label"><span>Cities Visited</span><span>📍</span></div>
          <div class="kpi-value" style="color: var(--accent-purple);">${s.cities_visited}</div>
          <div class="kpi-subtext">Rome, Turin, Athens, Prague, Cape Town</div>
        </div>
        <div class="kpi-card rose clickable" onclick="app.setTab('players')" title="Click to view Players Tracker">
          <div class="kpi-label"><span>Players Tracked</span><span>⭐</span></div>
          <div class="kpi-value" style="color: var(--accent-rose);">${s.total_players_tracked}</div>
          <div class="kpi-subtext">Alex Morgan, Pulisic, Vlahovic, Dybala →</div>
        </div>
      `;
    }
  },

  populateDropdowns() {
    const teamSelect = document.getElementById('game-team-filter');
    const arenaSelect = document.getElementById('game-arena-filter');
    if (!teamSelect || !arenaSelect || !this.data) return;

    teamSelect.innerHTML = '<option value="ALL">All Teams</option>';
    arenaSelect.innerHTML = '<option value="ALL">All Venues</option>';

    if (this.currentSport === 'nba') {
      if (this.data.trophy_teams) {
        this.data.trophy_teams.filter(t => t.seen).sort((a,b)=>a.name.localeCompare(b.name)).forEach(t => {
          const opt = document.createElement('option');
          opt.value = t.abbrev; opt.textContent = `${t.name} (${t.abbrev})`;
          teamSelect.appendChild(opt);
        });
      }
      if (this.data.trophy_arenas) {
        this.data.trophy_arenas.filter(a => a.visited).sort((a,b)=>a.name.localeCompare(b.name)).forEach(a => {
          const opt = document.createElement('option');
          opt.value = a.name; opt.textContent = `${a.name} (${a.city})`;
          arenaSelect.appendChild(opt);
        });
      }
    } else if (this.currentSport === 'mlb') {
      if (this.data.trophy_teams) {
        this.data.trophy_teams.filter(t => t.seen).sort((a,b)=>a.name.localeCompare(b.name)).forEach(t => {
          const opt = document.createElement('option');
          opt.value = t.abbrev; opt.textContent = `${t.name} (${t.abbrev})`;
          teamSelect.appendChild(opt);
        });
      }
      if (this.data.trophy_ballparks) {
        this.data.trophy_ballparks.sort((a,b)=>a.name.localeCompare(b.name)).forEach(b => {
          const opt = document.createElement('option');
          opt.value = b.name; opt.textContent = b.name;
          arenaSelect.appendChild(opt);
        });
      }
    } else if (this.currentSport === 'soccer') {
      if (this.data.trophy_teams) {
        this.data.trophy_teams.forEach(t => {
          const opt = document.createElement('option');
          opt.value = t; opt.textContent = t;
          teamSelect.appendChild(opt);
        });
      }
      if (this.data.trophy_stadiums) {
        this.data.trophy_stadiums.sort((a,b)=>a.name.localeCompare(b.name)).forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.name; opt.textContent = `${s.name} (${s.city})`;
          arenaSelect.appendChild(opt);
        });
      }
    }
  },

  setTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    document.querySelectorAll('.tab-view').forEach(view => {
      view.style.display = (view.id === `tab-${tabId}` ? 'block' : 'none');
    });

    if (tabId === 'games') gamesComponent.render();
    else if (tabId === 'performances') playersComponent.renderLeaderboard();
    else if (tabId === 'players') playersComponent.renderAggregates();
    else if (tabId === 'trophy') trophyComponent.render();
    else if (tabId === 'records') recordsComponent.render();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  handleGlobalSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) return;

    if (this.activeTab !== 'games') this.setTab('games');
    const input = document.getElementById('game-search-input');
    if (input) {
      input.value = query;
      gamesComponent.render();
    }
  },

  filterGamesByTeam(abbrev) {
    this.setTab('games');
    const select = document.getElementById('game-team-filter');
    const input = document.getElementById('game-search-input');
    if (select && Array.from(select.options).some(o => o.value === abbrev)) {
      select.value = abbrev;
    } else if (input) {
      input.value = abbrev;
    }
    gamesComponent.render();
    const el = document.getElementById('tab-games');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  },

  filterGamesByArena(arenaName) {
    this.setTab('games');
    const select = document.getElementById('game-arena-filter');
    const input = document.getElementById('game-search-input');
    if (select && Array.from(select.options).some(o => o.value === arenaName)) {
      select.value = arenaName;
    } else if (input) {
      input.value = arenaName;
    }
    gamesComponent.render();
    const el = document.getElementById('tab-games');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  },

  filterGamesByMilestone(milestoneId) {
    const m = (this.data?.milestones || []).find(x => x.id === milestoneId);
    this.setTab('games');
    const input = document.getElementById('game-search-input');
    const teamSelect = document.getElementById('game-team-filter');
    const arenaSelect = document.getElementById('game-arena-filter');
    const sortSelect = document.getElementById('game-sort-select');

    if (input) input.value = '';
    if (teamSelect) teamSelect.value = 'ALL';
    if (arenaSelect) arenaSelect.value = 'ALL';

    const target = m?.filter_target || '';
    if (target === 'thriller') {
      if (sortSelect) sortSelect.value = 'margin-asc';
    } else if (target && teamSelect && Array.from(teamSelect.options).some(o => o.value === target)) {
      teamSelect.value = target;
    } else if (target && arenaSelect && Array.from(arenaSelect.options).some(o => o.value === target)) {
      arenaSelect.value = target;
    } else if (target && input) {
      input.value = target;
    }

    gamesComponent.render();
    const el = document.getElementById('tab-games');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  },

  openPlayerDossier(playerName, playerType = 'nba') {
    playersComponent.openDossier(playerName, playerType);
  },

  closeModal() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }
};

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') app.closeModal();
});

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
