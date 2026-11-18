// trophy.js - Trophy Case Component (NBA, MLB, Soccer)
const trophyComponent = {
  currentView: 'teams', // 'teams', 'arenas', 'milestones'
  teamFilter: 'ALL',
  arenaFilter: 'ALL',

  updateButtonLabels() {
    const sport = app.currentSport;
    const btnTeams = document.getElementById('btn-trophy-teams');
    const btnArenas = document.getElementById('btn-trophy-arenas');
    const btnMilestones = document.getElementById('btn-trophy-milestones');

    if (sport === 'nba') {
      if (btnTeams) btnTeams.textContent = '🏀 NBA Teams (30)';
      if (btnArenas) btnArenas.textContent = '🏟️ Arenas Quest';
      if (btnMilestones) btnMilestones.textContent = '🏆 Milestone Badges';
    } else if (sport === 'mlb') {
      if (btnTeams) btnTeams.textContent = '⚾ MLB Franchises (30)';
      if (btnArenas) btnArenas.textContent = '🏟️ Park Chaser';
      if (btnMilestones) btnMilestones.textContent = '🏆 Milestone Badges';
    } else if (sport === 'soccer') {
      const teamsCount = app.data?.trophy_teams ? app.data.trophy_teams.length : 27;
      if (btnTeams) btnTeams.textContent = `⚽ Clubs & Nations (${teamsCount})`;
      if (btnArenas) btnArenas.textContent = '🌍 Stadium Explorer';
      if (btnMilestones) btnMilestones.textContent = '🏆 Milestone Badges';
    }
  },

  setView(view) {
    this.currentView = view;
    this.updateButtonLabels();

    document.getElementById('btn-trophy-teams')?.classList.toggle('active', view === 'teams');
    document.getElementById('btn-trophy-arenas')?.classList.toggle('active', view === 'arenas');
    document.getElementById('btn-trophy-milestones')?.classList.toggle('active', view === 'milestones');

    const teamsView = document.getElementById('trophy-teams-view');
    const arenasView = document.getElementById('trophy-arenas-view');
    const milestonesView = document.getElementById('trophy-milestones-view');

    if (teamsView) teamsView.style.display = (view === 'teams' ? 'block' : 'none');
    if (arenasView) arenasView.style.display = (view === 'arenas' ? 'block' : 'none');
    if (milestonesView) milestonesView.style.display = (view === 'milestones' ? 'block' : 'none');

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
        container.innerHTML = `<span style="font-size: 0.85rem; color: var(--text-secondary);">${app.data.trophy_teams.length} Clubs & National Teams Seen Live</span>`;
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
          <span style="font-size: 0.85rem; color: var(--accent-gold); font-weight: 700;">${app.data.trophy_stadiums.length} World Stadiums Visited Across 3 Continents</span>
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
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">ARENAS QUEST</span><span>🏟️</span>
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
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">PARK CHASER</span><span>🏟️</span>
          </div>
          <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0; color: var(--accent-emerald);">${s.total_ballparks_visited} <span style="font-size: 1rem; color: var(--text-muted);">Ballparks</span></div>
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${(s.total_ballparks_visited/30*100).toFixed(0)}%; background: linear-gradient(90deg, #10b981, #34d399);"></div></div>
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
            <span>Historic Cathedrals & Modern Gems</span><span>13 Parks Visited</span>
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
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">CLUBS & NATIONS QUEST</span><span>🛡️</span>
          </div>
          <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0; color: var(--accent-gold);">${s.total_teams} <span style="font-size: 1rem; color: var(--text-muted);">Teams</span></div>
          <div class="progress-bar-bg"><div class="progress-bar-fill gold" style="width: 100%;"></div></div>
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-gold);">
            <span>Real Madrid, Juve, Roma, Milan, USMNT</span><span>27 Distinct Teams</span>
          </div>
        </div>
        <div class="trophy-progress-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary);">STADIUM EXPLORER</span><span>🌍</span>
          </div>
          <div style="font-size: 2.25rem; font-weight: 900; margin: 0.25rem 0; color: var(--accent-cyan);">${s.total_stadiums} <span style="font-size: 1rem; color: var(--text-muted);">Stadiums</span></div>
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: 100%;"></div></div>
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--accent-cyan);">
            <span>Across 3 Continents & 10 Cities</span><span>12 Global Venues</span>
          </div>
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
              <div class="team-badge-circle" style="background: ${primaryColor}; width: 38px; height: 38px; font-size: 0.85rem; flex-shrink: 0;">
                ${t.abbrev}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                  <h4 style="font-size: 1rem; font-weight: 800; margin: 0;">${t.name}</h4>
                  <span style="font-size: 0.72rem; color: var(--text-muted);">${t.conf || t.league} • ${t.div}</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">
                  <span>🏟️ ${t.arena || t.stadium}</span> • <span>📍 ${t.city}</span>
                </div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0;">
              ${t.seen ? `
                <span class="seen-badge">✓ SEEN (${t.games_count} Games)</span>
                <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.35rem 0.65rem; color: var(--accent-cyan); border: 1px solid rgba(56,189,248,0.3); border-radius: var(--radius-sm); background: transparent; cursor: pointer; font-weight: 700;" onclick="app.filterGamesByTeam('${t.abbrev}')">View Games →</button>
              ` : `
                <span class="unseen-badge">LEFT TO SEE</span>
              `}
            </div>
          </div>
        `;
      }).join('');
    } else if (sport === 'soccer') {
      container.innerHTML = (app.data.trophy_teams || []).map(t => `
        <div class="trophy-team-card seen">
          <div class="team-card-header">
            <div class="team-badge-circle" style="background: #0284c7; width: 38px; height: 38px; font-size: 0.9rem; flex-shrink: 0;">
              ⚽
            </div>
            <div>
              <h4 style="font-size: 1rem; font-weight: 800; margin: 0;">${t}</h4>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Attended Match In Person</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="seen-badge">✓ SEEN LIVE</span>
            <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.35rem 0.65rem; color: var(--accent-cyan); border: 1px solid rgba(56,189,248,0.3); border-radius: var(--radius-sm); background: transparent; cursor: pointer; font-weight: 700;" onclick="app.filterGamesByTeam('${t.replace(/'/g, "\\'")}')">View Matches →</button>
          </div>
        </div>
      `).join('');
    }
  },

  renderSoccerWorldMap() {
    // 12 visited soccer stadiums coordinates
    const pins = [
      { name: 'Snapdragon Stadium', city: 'San Diego, USA', matches: 18, x: 175, y: 159 },
      { name: 'Torero Stadium', city: 'San Diego, USA', matches: 2, x: 174, y: 161 },
      { name: 'Rose Bowl', city: 'Pasadena (LA), USA', matches: 1, x: 172, y: 155 },
      { name: 'Dignity Health Sports Park', city: 'Carson (LA), USA', matches: 2, x: 171, y: 157 },
      { name: 'Avaya Stadium', city: 'San Jose, USA', matches: 1, x: 161, y: 146 },
      { name: 'FirstEnergy Stadium', city: 'Cleveland, USA', matches: 1, x: 273, y: 135 },
      { name: 'Talen Energy Stadium', city: 'Chester (Philly), USA', matches: 1, x: 291, y: 139 },
      { name: 'Generali Arena', city: 'Prague, Czechia', matches: 1, x: 540, y: 111 },
      { name: 'Allianz Stadium', city: 'Turin, Italy', matches: 1, x: 521, y: 125 },
      { name: 'Stadio Olimpico', city: 'Rome, Italy', matches: 1, x: 535, y: 134 },
      { name: 'Karaiskaki Stadium', city: 'Athens, Greece', matches: 1, x: 566, y: 145 },
      { name: 'Athlone Stadium', city: 'Cape Town, South Africa', matches: 1, x: 551, y: 344 },
    ];

    return `
      <div class="world-map-wrapper">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; margin: 0;">🌍 Global Football Explorer Map</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0.2rem 0 0;">12 Visited Stadiums across North America, Europe, and Africa. Hover or click any pin.</p>
          </div>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-gold); background: rgba(245,158,11,0.15); padding: 0.25rem 0.75rem; border-radius: 9999px;">3 Continents Visited</span>
        </div>

        <div style="position: relative; width: 100%; border-radius: var(--radius-md); overflow: hidden; background: #070d19; border: 1px solid var(--border-subtle);">
          <svg viewBox="0 0 1000 500" style="width: 100%; height: auto; display: block;">
            <!-- Grid Lines -->
            <defs>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/>
              </pattern>
              <radialGradient id="pin-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
                <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <rect width="1000" height="500" fill="#070d19"/>
            <rect width="1000" height="500" fill="url(#grid)"/>

            <!-- World Continents Simplified Outlines -->
            <!-- North America -->
            <path d="M 100,50 L 220,50 L 320,110 L 290,170 L 240,190 L 200,240 L 170,220 L 140,160 L 100,100 Z" fill="#131e33" stroke="#1e2e4a" stroke-width="1.2"/>
            <!-- South America -->
            <path d="M 230,250 L 310,270 L 340,330 L 290,440 L 260,450 L 230,350 Z" fill="#131e33" stroke="#1e2e4a" stroke-width="1.2"/>
            <!-- Europe -->
            <path d="M 470,70 L 590,70 L 580,150 L 520,160 L 480,130 Z" fill="#17243c" stroke="#253858" stroke-width="1.2"/>
            <!-- Africa -->
            <path d="M 470,170 L 580,170 L 610,250 L 560,370 L 510,360 L 460,250 Z" fill="#131e33" stroke="#1e2e4a" stroke-width="1.2"/>
            <!-- Asia -->
            <path d="M 600,60 L 850,70 L 880,180 L 750,220 L 650,250 L 600,160 Z" fill="#0f192b" stroke="#1a2b44" stroke-width="1.2"/>
            <!-- Australia -->
            <path d="M 780,310 L 880,310 L 890,390 L 800,400 Z" fill="#0f192b" stroke="#1a2b44" stroke-width="1.2"/>

            <!-- Equator & Meridian Line -->
            <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4,4"/>
            <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4,4"/>

            <!-- Stadium Pins -->
            ${pins.map((pin, i) => `
              <g class="map-pin" onclick="app.filterGamesByArena('${pin.name.replace(/'/g, "\\'")}')" style="cursor: pointer;">
                <circle cx="${pin.x}" cy="${pin.y}" r="12" fill="url(#pin-glow)"/>
                <circle cx="${pin.x}" cy="${pin.y}" r="4.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
                <text x="${pin.x}" y="${pin.y - 8}" font-size="8" fill="#e2e8f0" font-weight="700" text-anchor="middle" style="text-shadow: 0 1px 3px rgba(0,0,0,0.9); pointer-events: none;">
                  ${pin.name}
                </text>
                <title>${pin.name} (${pin.city}) - ${pin.matches} Matches Attended</title>
              </g>
            `).join('')}
          </svg>
        </div>
      </div>
    `;
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
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="font-size: 1.5rem;">${a.visited ? '🏟️' : '📍'}</div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <h4 style="font-size: 1rem; font-weight: 800; margin: 0;">${a.name}</h4>
                <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 600;">${a.team}</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">
                <span>📍 ${a.city}</span> • <span>👥 Capacity: ${a.capacity ? a.capacity.toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0;">
            ${a.visited ? `
              <span class="seen-badge">VISITED (${a.games_count} Games)</span>
              <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.35rem 0.65rem; color: var(--accent-cyan); border: 1px solid rgba(56,189,248,0.3); border-radius: var(--radius-sm); background: transparent; cursor: pointer; font-weight: 700;" onclick="app.filterGamesByArena('${a.name.replace(/'/g, "\\'")}')">View Games →</button>
            ` : `
              <span class="unseen-badge">BUCKET LIST</span>
            `}
          </div>
        </div>
      `).join('');
    } else if (sport === 'mlb') {
      container.innerHTML = (app.data.trophy_ballparks || []).map(b => `
        <div class="arena-card visited">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="font-size: 1.5rem;">⚾</div>
            <div>
              <h4 style="font-size: 1rem; font-weight: 800; margin: 0;">${b.name}</h4>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">
                <span>Attended: <strong>${b.games_count} Games</strong></span> • <span>First: ${b.first_game} • Latest: ${b.last_game}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0;">
            <span class="seen-badge">VISITED (${b.games_count}x)</span>
            <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.35rem 0.65rem; color: var(--accent-emerald); border: 1px solid rgba(16,185,129,0.3); border-radius: var(--radius-sm); background: transparent; cursor: pointer; font-weight: 700;" onclick="app.filterGamesByArena('${b.name.replace(/'/g, "\\'")}')">View Games →</button>
          </div>
        </div>
      `).join('');
    } else if (sport === 'soccer') {
      const mapHtml = this.renderSoccerWorldMap();
      const listHtml = (app.data.trophy_stadiums || []).map(s => `
        <div class="arena-card visited">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="font-size: 1.5rem;">🌍</div>
            <div>
              <h4 style="font-size: 1rem; font-weight: 800; margin: 0;">${s.name}</h4>
              <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">
                <span style="color: var(--accent-gold); font-weight: 600;">📍 ${s.city}</span> • <span>Matches: ${s.first_match} to ${s.last_match}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0;">
            <span class="seen-badge">VISITED (${s.matches_count}x)</span>
            <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.35rem 0.65rem; color: var(--accent-cyan); border: 1px solid rgba(56,189,248,0.3); border-radius: var(--radius-sm); background: transparent; cursor: pointer; font-weight: 700;" onclick="app.filterGamesByArena('${s.name.replace(/'/g, "\\'")}')">View Matches →</button>
          </div>
        </div>
      `).join('');

      container.innerHTML = mapHtml + listHtml;
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
          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.4rem;">
            📍 <strong>Venue:</strong> ${m.venue}
          </div>
          <div>
            <button class="milestone-link-btn" onclick="app.filterGamesByMilestone('${m.id}')">
              View Games in Log →
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  render() {
    this.updateButtonLabels();
    this.renderSummaryCards();
    if (this.currentView === 'teams') this.renderTeams();
    else if (this.currentView === 'arenas') this.renderArenas();
    else if (this.currentView === 'milestones') this.renderMilestones();
  }
};
