// trophy.js - Trophy Case Component (Teams, Arenas & Milestone Achievements)
const trophyComponent = {
  currentView: 'teams', // 'teams', 'arenas', 'milestones'
  teamFilter: 'ALL', // 'ALL', 'SEEN', 'UNSEEN', 'EAST', 'WEST'
  arenaFilter: 'ALL', // 'ALL', 'VISITED', 'LEFT'

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
    if (!container) return;

    if (this.currentView === 'teams') {
      container.innerHTML = `
        <button class="chip-btn ${this.teamFilter === 'ALL' ? 'active' : ''}" onclick="trophyComponent.setTeamFilter('ALL')">All 30 Teams</button>
        <button class="chip-btn ${this.teamFilter === 'SEEN' ? 'active' : ''}" onclick="trophyComponent.setTeamFilter('SEEN')">Seen (${app.data.summary.total_teams_seen})</button>
        <button class="chip-btn ${this.teamFilter === 'UNSEEN' ? 'active' : ''}" onclick="trophyComponent.setTeamFilter('UNSEEN')">Left to See (11)</button>
        <button class="chip-btn ${this.teamFilter === 'WEST' ? 'active' : ''}" onclick="trophyComponent.setTeamFilter('WEST')">Western Conf</button>
        <button class="chip-btn ${this.teamFilter === 'EAST' ? 'active' : ''}" onclick="trophyComponent.setTeamFilter('EAST')">Eastern Conf</button>
      `;
    } else if (this.currentView === 'arenas') {
      container.innerHTML = `
        <button class="chip-btn ${this.arenaFilter === 'ALL' ? 'active' : ''}" onclick="trophyComponent.setArenaFilter('ALL')">All Arenas (${app.data.trophy_arenas.length})</button>
        <button class="chip-btn ${this.arenaFilter === 'VISITED' ? 'active' : ''}" onclick="trophyComponent.setArenaFilter('VISITED')">Visited (${app.data.summary.total_active_arenas_seen + app.data.summary.total_historic_arenas_seen})</button>
        <button class="chip-btn ${this.arenaFilter === 'LEFT' ? 'active' : ''}" onclick="trophyComponent.setArenaFilter('LEFT')">Active Left to Visit (18)</button>
      `;
    } else {
      container.innerHTML = `
        <span style="font-size: 0.85rem; color: var(--accent-gold); font-weight: 700;">✨ All 12 Milestone Badges Unlocked!</span>
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
    container.innerHTML = `
      <div class="trophy-progress-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);">NBA Teams Quest</span>
          <span style="font-size: 1.25rem;">🏀</span>
        </div>
        <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0; color: var(--text-primary);">
          ${s.total_teams_seen} <span style="font-size: 1rem; color: var(--text-muted); font-weight: 600;">/ 30 Teams</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${s.teams_completion_pct}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
          <span>${s.teams_completion_pct}% Completed</span>
          <span style="color: var(--accent-cyan); font-weight: 700;">${30 - s.total_teams_seen} Teams Left</span>
        </div>
      </div>

      <div class="trophy-progress-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);">Active NBA Arenas Quest</span>
          <span style="font-size: 1.25rem;">🏟️</span>
        </div>
        <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0; color: var(--text-primary);">
          ${s.total_active_arenas_seen} <span style="font-size: 1rem; color: var(--text-muted); font-weight: 600;">/ 30 Active</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill gold" style="width: ${s.arenas_completion_pct}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
          <span>${s.arenas_completion_pct}% Active Visited</span>
          <span style="color: var(--accent-gold); font-weight: 700;">+${s.total_historic_arenas_seen} Historic/Neutral</span>
        </div>
      </div>

      <div class="trophy-progress-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);">Milestone Trophies</span>
          <span style="font-size: 1.25rem;">🏆</span>
        </div>
        <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0; color: var(--accent-gold);">
          ${app.data.milestones.length} <span style="font-size: 1rem; color: var(--text-muted); font-weight: 600;">/ ${app.data.milestones.length} Badges</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: 100%; background: linear-gradient(90deg, #10b981, #059669);"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--accent-emerald);">
          <span>100% Unlocked</span>
          <span style="font-weight: 700;">All Historical Moments Verified</span>
        </div>
      </div>
    `;
  },

  renderTeams() {
    const container = document.getElementById('teams-quest-container');
    if (!container || !app.data) return;

    let list = [...app.data.trophy_teams];

    if (this.teamFilter === 'SEEN') list = list.filter(t => t.seen);
    else if (this.teamFilter === 'UNSEEN') list = list.filter(t => !t.seen);
    else if (this.teamFilter === 'EAST') list = list.filter(t => t.conf === 'Eastern');
    else if (this.teamFilter === 'WEST') list = list.filter(t => t.conf === 'Western');

    // Sort: seen teams first, then by games_count
    list.sort((a, b) => {
      if (a.seen && !b.seen) return -1;
      if (!a.seen && b.seen) return 1;
      return b.games_count - a.games_count;
    });

    container.innerHTML = list.map(t => {
      const primaryColor = t.colors[0] || '#38bdf8';
      return `
        <div class="trophy-team-card ${t.seen ? 'seen' : 'unseen'}">
          <div class="team-card-header">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <div class="team-badge-circle" style="background: ${primaryColor}; width: 34px; height: 34px; font-size: 0.8rem;">
                ${t.abbrev}
              </div>
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 800;">${t.name}</h4>
                <div style="font-size: 0.72rem; color: var(--text-muted);">${t.conf} • ${t.div}</div>
              </div>
            </div>
            ${t.seen ? 
              `<span class="seen-badge">✓ SEEN (${t.games_count}x)</span>` : 
              `<span class="unseen-badge">LEFT TO SEE</span>`
            }
          </div>

          <div style="margin-top: 0.75rem; font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5;">
            <div>🏟️ <strong>Home Arena:</strong> ${t.arena}</div>
            <div>📍 <strong>City:</strong> ${t.city}</div>
            ${t.seen ? `
              <div style="margin-top: 0.35rem; padding-top: 0.35rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between;">
                <span>Your Record: <strong>${t.wins}-${t.losses}</strong> (${(t.win_pct * 100).toFixed(0)}%)</span>
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
  },

  renderArenas() {
    const container = document.getElementById('arenas-quest-container');
    if (!container || !app.data) return;

    let list = [...app.data.trophy_arenas];

    if (this.arenaFilter === 'VISITED') list = list.filter(a => a.visited);
    else if (this.arenaFilter === 'LEFT') list = list.filter(a => a.active && !a.visited);

    // Sort: visited first, then by games_count
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
              <h4 style="font-size: 0.95rem; font-weight: 800; color: ${a.visited ? 'var(--text-primary)' : 'var(--text-secondary)'};">
                ${a.name}
              </h4>
              <div style="font-size: 0.75rem; color: var(--accent-cyan);">${a.team}</div>
            </div>
            ${a.visited ? 
              `<span class="seen-badge">VISITED (${a.games_count} Games)</span>` : 
              `<span class="unseen-badge">NEED TO VISIT</span>`
            }
          </div>

          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.4;">
            <div>📍 <strong>Location:</strong> ${a.city}</div>
            <div>👥 <strong>Capacity:</strong> ${a.capacity.toLocaleString()}</div>
            ${!a.active ? `<div style="color: var(--accent-gold); font-size: 0.72rem; margin-top: 2px;">🏛️ Historical / Special Venue</div>` : ''}
          </div>
        </div>

        ${a.visited ? `
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid var(--border-subtle); font-size: 0.72rem; color: var(--text-muted); display: flex; justify-content: space-between;">
            <span>First: ${a.first_game}</span>
            <span>Latest: ${a.last_game}</span>
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  renderMilestones() {
    const container = document.getElementById('milestones-container');
    if (!container || !app.data) return;

    container.innerHTML = app.data.milestones.map(m => `
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
