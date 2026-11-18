// app.js - Main Application Controller
const app = {
  data: null,
  activeTab: 'games',
  teamColors: {},

  async init() {
    try {
      const response = await fetch('./data.json');
      this.data = await response.json();
      console.log("SportsLog loaded successfully:", this.data);

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

  initTeamColors() {
    if (this.data && this.data.trophy_teams) {
      this.data.trophy_teams.forEach(t => {
        this.teamColors[t.abbrev] = t.colors[0] || '#38bdf8';
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
    if (!container) return;

    container.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-label">
          <span>Games Attended</span>
          <span>🏟️</span>
        </div>
        <div class="kpi-value">${s.total_games}</div>
        <div class="kpi-subtext">Across 18 Distinct Arenas</div>
      </div>

      <div class="kpi-card gold">
        <div class="kpi-label">
          <span>NBA Teams Seen</span>
          <span>🏀</span>
        </div>
        <div class="kpi-value" style="color: var(--accent-gold);">${s.total_teams_seen} <span style="font-size: 1rem; color: var(--text-muted);">/ 30</span></div>
        <div class="kpi-subtext">${s.teams_completion_pct}% of the Entire League</div>
      </div>

      <div class="kpi-card emerald">
        <div class="kpi-label">
          <span>Active Arenas Visited</span>
          <span>📍</span>
        </div>
        <div class="kpi-value" style="color: var(--accent-emerald);">${s.total_active_arenas_seen} <span style="font-size: 1rem; color: var(--text-muted);">/ 30</span></div>
        <div class="kpi-subtext">+6 Historical & Neutral Venues</div>
      </div>

      <div class="kpi-card purple">
        <div class="kpi-label">
          <span>Total Points Witnessed</span>
          <span>🔥</span>
        </div>
        <div class="kpi-value" style="color: var(--accent-purple);">${s.total_points_seen.toLocaleString()}</div>
        <div class="kpi-subtext">Avg ${s.avg_points_per_game} Points / Game</div>
      </div>

      <div class="kpi-card rose">
        <div class="kpi-label">
          <span>Players Logged</span>
          <span>👥</span>
        </div>
        <div class="kpi-value" style="color: var(--accent-rose);">${s.total_players_seen}</div>
        <div class="kpi-subtext">1,036 Individual Statlines</div>
      </div>
    `;
  },

  populateDropdowns() {
    // Teams dropdown
    const teamSelect = document.getElementById('game-team-filter');
    if (teamSelect && this.data.trophy_teams) {
      const seenTeams = this.data.trophy_teams.filter(t => t.seen);
      seenTeams.sort((a, b) => a.name.localeCompare(b.name));
      seenTeams.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.abbrev;
        opt.textContent = `${t.name} (${t.abbrev})`;
        teamSelect.appendChild(opt);
      });
    }

    // Arenas dropdown
    const arenaSelect = document.getElementById('game-arena-filter');
    if (arenaSelect && this.data.trophy_arenas) {
      const visitedArenas = this.data.trophy_arenas.filter(a => a.visited);
      visitedArenas.sort((a, b) => a.name.localeCompare(b.name));
      visitedArenas.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.name;
        opt.textContent = `${a.name} (${a.city})`;
        arenaSelect.appendChild(opt);
      });
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

    // Search in games first
    const matchGame = this.data.games.find(g => 
      g.home.team.toLowerCase().includes(q) ||
      g.away.team.toLowerCase().includes(q) ||
      g.arena.toLowerCase().includes(q)
    );

    const matchPlayer = this.data.players.find(p => p.name.toLowerCase().includes(q));

    if (matchPlayer && (!matchGame || this.activeTab === 'players' || this.activeTab === 'performances')) {
      if (this.activeTab !== 'players' && this.activeTab !== 'performances') {
        this.setTab('players');
      }
      document.getElementById('player-agg-search').value = query;
      playersComponent.renderAggregates();
    } else {
      if (this.activeTab !== 'games') {
        this.setTab('games');
      }
      document.getElementById('game-search-input').value = query;
      gamesComponent.render();
    }
  },

  filterGamesByTeam(abbrev) {
    this.setTab('games');
    const select = document.getElementById('game-team-filter');
    if (select) {
      select.value = abbrev;
      gamesComponent.render();
    }
  },

  openPlayerDossier(playerName) {
    playersComponent.openDossier(playerName);
  },

  closeModal() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  },

  showSportPreview(sport) {
    const modal = document.getElementById('sport-preview-modal');
    const title = document.getElementById('sport-preview-title');
    const body = document.getElementById('sport-preview-body');

    if (sport === 'mlb') {
      title.textContent = '⚾ MLB Attendance Log (54 Games Logged)';
      body.innerHTML = `
        <div style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
          <p style="margin-bottom: 1rem;">
            Your gathered MLB data contains <strong>54 attended games</strong>, <strong>1,228 batting performances</strong>, and <strong>454 pitching outings</strong>!
          </p>
          <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">📁 Available Datasets:</div>
            <ul style="padding-left: 1.25rem; font-size: 0.82rem; color: var(--accent-cyan);">
              <li><code>all_games.csv</code> (54 games with Date, Home, Away, Score, Stadium, Duration)</li>
              <li><code>all_batting.csv</code> (1,228 player batting statlines with AB, R, H, HR, RBI, BB, SO)</li>
              <li><code>all_pitching.csv</code> (454 pitching statlines with IP, H, R, ER, BB, SO, HR, ERA)</li>
            </ul>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted);">
            We started with NBA per your request. The app's architecture is built to seamlessly plug in MLB and Soccer next!
          </p>
        </div>
      `;
    } else if (sport === 'soccer') {
      title.textContent = '⚽ Soccer Attendance Log (31 Games Logged)';
      body.innerHTML = `
        <div style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
          <p style="margin-bottom: 1rem;">
            Your gathered soccer data contains <strong>31 attended matches</strong> across domestic leagues, international friendlies, and tournaments!
          </p>
          <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">📁 Available Datasets:</div>
            <ul style="padding-left: 1.25rem; font-size: 0.82rem; color: var(--accent-emerald);">
              <li><code>gamelog.csv</code> (31 matches with Date, Home, Away, Score, Stadium, City, Attendance)</li>
              <li><code>playerstats.xlsx</code> & <code>soccerStats.ipynb</code> (Player statlines & box scores)</li>
            </ul>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted);">
            Ready to be activated once you want to expand beyond the NBA module!
          </p>
        </div>
      `;
    }

    modal.classList.add('active');
  },

  switchSport(sport) {
    if (sport === 'nba') {
      this.setTab('games');
    }
  }
};

// Keyboard listener for ESC to close modals
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') app.closeModal();
});

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
