// trophy.js - Trophy Case Component (NBA, MLB, Soccer)
const trophyComponent = {
  currentView: 'teams', // 'teams', 'arenas', 'milestones'
  teamFilter: 'ALL',
  arenaFilter: 'ALL',

  setView(view) {
    this.currentView = view;
    document.getElementById('btn-trophy-teams').classList.toggle('active', view === 'teams');
    document.getElementById('btn-trophy-arenas').classList.toggle('active', view === 'arenas');
    document.getElementById('btn-trophy-milestones').classList.toggle('active', view === 'milestones');

    document.getElementById('trophy-teams-view').style.display = (view === 'teams' ? 'block' : 'none');
    document.getElementById('trophy-arenas-view').style.display = (view === 'arenas' ? 'block' : 'none');
    document.getElementById('trophy-milestones-view').style.display = (view === 'milestones' ? 'block' : 'none');

    this.renderSubfilters();
    this.render();
  },

  renderSubfilters() {
    const container = document.getElementById('trophy-subfilters');
    if (!container || !app.data) return;

    const sport = app.currentSport;

    if (this.currentView === 'teams') {
      if (sport === 'nba') {
        container.innerHTML = `
          <button class="chip-btn ${this.teamFilter === 'ALL' ? 'active' : ''}" onclick="trophyComponent.setTeamFilter('ALL')">All 30 Teams</button>
          <button class="chip-btn ${this.teamFilter === 'SEEN' ? 'active' : ''}" onclick="trophyComponent.setTeamFilter('SEEN')">Seen (${app.data.summary.total_teams_seen})</button>
          <button class="chip-btn ${this.teamFilter === 'UNSEEN' ? 'active' : ''}" onclick="trophyComponent.setTeamFilter('UNSEEN')">Left to See (11)</button>
        `;
      } else if (sport === 'mlb') {
        container.innerHTML = `
          <button class="chip-btn ${this.teamFilter === 'ALL' ? 'active' : ''}" onclick="trophyComponent.setTeamFilter('ALL')">All 30 MLB Franchises</button>
          <button class="chip-btn ${this.teamFilter === 'SEEN' ? 'active' : ''}" onclick="trophyComponent.setTeamFilter('SEEN')">Seen (${app.data.summary.total_teams_seen})</button>
          <button class="chip-btn ${this.teamFilter === 'UNSEEN' ? 'active' : ''}" onclick="trophyComponent.setTeamFilter('UNSEEN')">Left to See (3)</button>
        `;
      } else {
        container.innerHTML = `<span style="font-size: 0.85rem; color: var(--text-secondary);">${app.data.trophy_teams.length} Clubs & National Teams Seen</span>`;
      }
    } else if (this.currentView === 'arenas') {
      if (sport === 'nba') {
        container.innerHTML = `
          <button class="chip-btn ${this.arenaFilter === 'ALL' ? 'active' : ''}" onclick="trophyComponent.setArenaFilter('ALL')">All Arenas</button>
          <button class="chip-btn ${this.arenaFilter === 'VISITED' ? 'active' : ''}" onclick="trophyComponent.setArenaFilter('VISITED')">Visited (${app.data.summary.total_active_arenas_seen + app.data.summary.total_historic_arenas_seen})</button>
          <button class="chip-btn ${this.arenaFilter === 'LEFT' ? 'active' : ''}" onclick="trophyComponent.setArenaFilter('LEFT')">Active Left (18)</button>
        `;
      } else if (sport === 'mlb') {
        container.innerHTML = `
          <span style="font-size: 0.85rem; color: var(--accent-emerald); font-weight: 700;">${app.data.trophy_ballparks.length} Unique MLB Ballparks Visited</span>
        `;
      } else {
        container.innerHTML = `
          <span style="font-size: 0.85rem; color: var(--accent-gold); font-weight: 700;">${app.data.trophy_stadiums.length} World Stadiums Visited</span>
        `;
      }
    } else {
      container.innerHTML = `
        <span style="font-size: 0.85rem; color: var(--accent-gold); font-weight: 700;">✨ All ${app.data.milestones.length} Milestone Badges Unlocked!</span>
      `;
    }
  },

  setTeamFilter(filter) {
    this.teamFilter = filter;
    this.renderSubfilters();
    this.renderTeams();
  },

  setArenaFilter(filter) {
    this.arenaFilter = filter;
    this.renderSubfilters();
    this.renderArenas();
  },

  renderSummaryCards() {
    const container = document.getElementById('trophy-summary-cards');
    if (!container || !app.data) return;

    const s = app.data.summary;
    const sport = app.currentSport;

    if (sport === 'nba') {
      container.innerHTML = `
        <div class="trophy-progress-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">NBA TEAMS QUEST</span><span>🏀</span>
          </div>
          <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0;">${s.total_teams_seen} <span style="font-size: 1rem; color: var(--text-muted);">/ 30 Teams</span></div>
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${s.teams_completion_pct}%;"></div></div>
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
            <span>${s.teams_completion_pct}% Completed</span><span style="color: var(--accent-cyan); font-weight: 700;">${30 - s.total_teams_seen} Left</span>
          </div>
        </div>
        <div class="trophy-progress-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">ACTIVE ARENAS QUEST</span><span>🏟️</span>
          </div>
          <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0;">${s.total_active_arenas_seen} <span style="font-size: 1rem; color: var(--text-muted);">/ 30 Active</span></div>
          <div class="progress-bar-bg"><div class="progress-bar-fill gold" style="width: ${s.arenas_completion_pct}%;"></div></div>
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
            <span>${s.arenas_completion_pct}% Active</span><span style="color: var(--accent-gold); font-weight: 700;">+${s.total_historic_arenas_seen} Historic/Neutral</span>
          </div>
        </div>
        <div class="trophy-progress-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">TROPHY BADGES</span><span>🏆</span>
          </div>
          <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0; color: var(--accent-gold);">${app.data.milestones.length} <span style="font-size: 1rem; color: var(--text-muted);">Badges</span></div>
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: 100%; background: linear-gradient(90deg, #10b981, #059669);"></div></div>
          <div style="font-size: 0.75rem; color: var(--accent-emerald);"><span>100% Unlocked</span></div>
        </div>
      `;
    } else if (sport === 'mlb') {
      container.innerHTML = `
        <div class="trophy-progress-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">MLB FRANCHISES QUEST</span><span>⚾</span>
          </div>
          <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0; color: var(--accent-gold);">${s.total_teams_seen} <span style="font-size: 1rem; color: var(--text-muted);">/ 30 Teams</span></div>
          <div class="progress-bar-bg"><div class="progress-bar-fill gold" style="width: ${s.teams_completion_pct}%;"></div></div>
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
            <span style="color: var(--accent-gold); font-weight: 700;">${s.teams_completion_pct}% Completed!</span><span>Only 3 Teams Left!</span>
          </div>
        </div>
        <div class="trophy-progress-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">BALLPARKS VISITED</span><span>🏟️</span>
          </div>
          <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0; color: var(--accent-emerald);">${s.total_ballparks_visited} <span style="font-size: 1rem; color: var(--text-muted);">Ballparks</span></div>
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${(s.total_ballparks_visited/30*100).toFixed(0)}%; background: linear-gradient(90deg, #10b981, #34d399);"></div></div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">
            <span>Historic Cathedrals & Modern Gems</span>
          </div>
        </div>
        <div class="trophy-progress-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">MLB MILESTONES</span><span>🏆</span>
          </div>
          <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0; color: var(--accent-purple);">${app.data.milestones.length} <span style="font-size: 1rem; color: var(--text-muted);">Badges</span></div>
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: 100%; background: linear-gradient(90deg, #818cf8, #c084fc);"></div></div>
          <div style="font-size: 0.75rem; color: var(--accent-purple);"><span>Manny 10 HRs, Halladay CGSO, Postseason</span></div>
        </div>
      `;
    } else if (sport === 'soccer') {
      container.innerHTML = `
        <div class="trophy-progress-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">GLOBAL FOOTBALL TOUR</span><span>🌍</span>
          </div>
          <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0; color: var(--accent-cyan);">${s.total_stadiums} <span style="font-size: 1rem; color: var(--text-muted);">Stadiums</span></div>
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: 100%;"></div></div>
          <div style="font-size: 0.75rem; color: var(--accent-cyan);"><span>Across 4 Continents & 10 Cities</span></div>
        </div>
        <div class="trophy-progress-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">TEAMS SEEN</span><span>🛡️</span>
          </div>
          <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0; color: var(--accent-gold);">${s.total_teams} <span style="font-size: 1rem; color: var(--text-muted);">Clubs & Nations</span></div>
          <div class="progress-bar-bg"><div class="progress-bar-fill gold" style="width: 100%;"></div></div>
          <div style="font-size: 0.75rem; color: var(--accent-gold);"><span>Real Madrid, Juve, Roma, Milan, USMNT</span></div>
        </div>
        <div class="trophy-progress-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">FOOTBALL MILESTONES</span><span>🏆</span>
          </div>
          <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0; color: var(--accent-emerald);">${app.data.milestones.length} <span style="font-size: 1rem; color: var(--text-muted);">Badges</span></div>
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: 100%; background: linear-gradient(90deg, #10b981, #059669);"></div></div>
          <div style="font-size: 0.75rem; color: var(--accent-emerald);"><span>Rose Bowl, Serie A, Euro Qualifier, NWSL</span></div>
        </div>
      `;
    }
  },

  renderTeams() {
    const container = document.getElementById('teams-quest-container');
    if (!container || !app.data) return;

    const sport = app.currentSport;

    if (sport === 'nba' || sport === 'mlb') {
      let list = [...app.data.trophy_teams];
      if (this.teamFilter === 'SEEN') list = list.filter(t => t.seen);
      else if (this.teamFilter === 'UNSEEN') list = list.filter(t => !t.seen);

      list.sort((a, b) => {
        if (a.seen && !b.seen) return -1;
        if (!a.seen && b.seen) return 1;
        return b.games_count - a.games_count;
      });

      container.innerHTML = list.map(t => {
        const primaryColor = (t.colors && t.colors[0]) || '#38bdf8';
        return `
          <div class="trophy-team-card ${t.seen ? 'seen' : 'unseen'}">
            <div class="team-card-header">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <div class="team-badge-circle" style="background: ${primaryColor}; width: 34px; height: 34px; font-size: 0.8rem;">
                  ${t.abbrev}
                </div>
                <div>
                  <h4 style="font-size: 0.95rem; font-weight: 800;">${t.name}</h4>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">${t.conf || t.league} • ${t.div}</div>
                </div>
              </div>
              ${t.seen ? 
                `<span class="seen-badge">✓ SEEN (${t.games_count}x)</span>` : 
                `<span class="unseen-badge">LEFT TO SEE</span>`
              }
            </div>
            <div style="margin-top: 0.75rem; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5;">
              <div>🏟️ <strong>Home Venue:</strong> ${t.arena || t.stadium}</div>
              <div>📍 <strong>City:</strong> ${t.city}</div>
              ${t.seen ? `
                <div style="margin-top: 0.35rem; padding-top: 0.35rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between;">
                  <span>Attended: <strong>${t.games_count} Games</strong></span>
                  <span style="color: var(--accent-cyan); font-weight: 600; cursor: pointer;" onclick="app.filterGamesByTeam('${t.abbrev}')">View Games →</span>
                </div>
              ` : `
                <div style="margin-top: 0.35rem; padding-top: 0.35rem; border-top: 1px solid var(--border-subtle); color: var(--text-muted); font-style: italic;">
                  On your bucket list to see live!
                </div>
              `}
            </div>
          </div>
        `;
      }).join('');
    } else if (sport === 'soccer') {
      container.innerHTML = (app.data.trophy_teams || []).map(t => `
        <div class="trophy-team-card seen">
          <div class="team-card-header">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <div class="team-badge-circle" style="background: #0284c7; width: 34px; height: 34px; font-size: 0.8rem;">⚽</div>
              <div><h4 style="font-size: 0.95rem; font-weight: 800;">${t}</h4></div>
            </div>
            <span class="seen-badge">✓ SEEN</span>
          </div>
        </div>
      `).join('');
    }
  },

  renderArenas() {
    const container = document.getElementById('arenas-quest-container');
    if (!container || !app.data) return;

    const sport = app.currentSport;

    if (sport === 'nba') {
      let list = [...app.data.trophy_arenas];
      if (this.arenaFilter === 'VISITED') list = list.filter(a => a.visited);
      else if (this.arenaFilter === 'LEFT') list = list.filter(a => a.active && !a.visited);

      list.sort((a, b) => {
        if (a.visited && !b.visited) return -1;
        if (!a.visited && b.visited) return 1;
        return b.games_count - a.games_count;
      });

      container.innerHTML = list.map(a => `
        <div class="arena-card ${a.visited ? 'visited' : 'not-visited'}">
          <div>
            <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.5rem;">
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 800;">${a.name}</h4>
                <div style="font-size: 0.75rem; color: var(--accent-cyan);">${a.team}</div>
              </div>
              ${a.visited ? `<span class="seen-badge">VISITED (${a.games_count} Games)</span>` : `<span class="unseen-badge">NEED TO VISIT</span>`}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.4;">
              <div>📍 <strong>Location:</strong> ${a.city}</div>
              <div>👥 <strong>Capacity:</strong> ${a.capacity ? a.capacity.toLocaleString() : '-'}</div>
            </div>
          </div>
        </div>
      `).join('');
    } else if (sport === 'mlb') {
      container.innerHTML = (app.data.trophy_ballparks || []).map(b => `
        <div class="arena-card visited">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.5rem;">
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 800;">${b.name}</h4>
              <div style="font-size: 0.75rem; color: var(--accent-emerald);">Attended: ${b.games_count} Games</div>
            </div>
            <span class="seen-badge">VISITED</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
            <span>First: ${b.first_game} • Latest: ${b.last_game}</span>
          </div>
        </div>
      `).join('');
    } else if (sport === 'soccer') {
      container.innerHTML = (app.data.trophy_stadiums || []).map(s => `
        <div class="arena-card visited">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.5rem;">
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 800;">${s.name}</h4>
              <div style="font-size: 0.75rem; color: var(--accent-gold);">📍 ${s.city}</div>
            </div>
            <span class="seen-badge">VISITED (${s.matches_count}x)</span>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">
            <span>Matches: ${s.first_match} to ${s.last_match}</span>
          </div>
        </div>
      `).join('');
    }
  },

  renderMilestones() {
    const container = document.getElementById('milestones-container');
    if (!container || !app.data) return;

    container.innerHTML = (app.data.milestones || []).map(m => `
      <div class="milestone-card">
        <div class="milestone-icon">${m.icon}</div>
        <div class="milestone-info">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span class="milestone-tag">${m.badge} • ${m.category}</span>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${m.date}</span>
          </div>
          <h4>${m.title}</h4>
          <p>${m.description}</p>
          <div style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 600;">
            📍 Verified Venue: ${m.venue}
          </div>
        </div>
      </div>
    `).join('');
  },

  render() {
    this.renderSummaryCards();
    if (this.currentView === 'teams') this.renderTeams();
    else if (this.currentView === 'arenas') this.renderArenas();
    else if (this.currentView === 'milestones') this.renderMilestones();
  }
};
