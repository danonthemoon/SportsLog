// players.js - Performance Leaderboard and Player Aggregates (NBA, MLB, Soccer)
const playersComponent = {
  mlbMode: 'batting', // 'batting' or 'pitching'
  perfState: {
    sortCol: 'PTS',
    sortAsc: false,
    preset: 'ALL',
    page: 1,
    pageSize: 25,
  },
  aggState: {
    sortCol: 'pts',
    sortAsc: false,
  },

  setPerfPreset(preset) {
    this.perfState.preset = preset;
    this.perfState.page = 1;
    document.querySelectorAll('#tab-performances .chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('onclick')?.includes(preset));
    });
    this.renderLeaderboard();
  },

  sortPerfBy(col) {
    if (this.perfState.sortCol === col) {
      this.perfState.sortAsc = !this.perfState.sortAsc;
    } else {
      this.perfState.sortCol = col;
      this.perfState.sortAsc = false;
    }
    this.renderLeaderboard();
  },

  changePage(delta) {
    this.perfState.page += delta;
    this.renderLeaderboard();
  },

  renderLeaderboard() {
    const tbody = document.getElementById('performances-tbody');
    const tableThead = document.querySelector('#performances-table thead tr');
    if (!tbody || !app.data) return;

    const sport = app.currentSport;
    const searchTerm = (document.getElementById('perf-search-input')?.value || '').toLowerCase().trim();

    if (sport === 'nba') {
      tableThead.innerHTML = `
        <th class="text-left" onclick="playersComponent.sortPerfBy('NAME')">Player ↕</th>
        <th onclick="playersComponent.sortPerfBy('DATE')">Date ↕</th>
        <th onclick="playersComponent.sortPerfBy('TEAM')">Team ↕</th>
        <th onclick="playersComponent.sortPerfBy('OPP')">Opp ↕</th>
        <th onclick="playersComponent.sortPerfBy('MINS')">MIN ↕</th>
        <th onclick="playersComponent.sortPerfBy('PTS')" style="color: var(--accent-cyan);">PTS ↕</th>
        <th onclick="playersComponent.sortPerfBy('REB')">REB ↕</th>
        <th onclick="playersComponent.sortPerfBy('AST')">AST ↕</th>
        <th onclick="playersComponent.sortPerfBy('STL')">STL ↕</th>
        <th onclick="playersComponent.sortPerfBy('BLK')">BLK ↕</th>
        <th onclick="playersComponent.sortPerfBy('3PM')">3PM ↕</th>
        <th onclick="playersComponent.sortPerfBy('FG%')">FG% ↕</th>
        <th onclick="playersComponent.sortPerfBy('GAME_SCORE')" style="color: var(--accent-gold);">GameScore ↕</th>
      `;

      let list = [...app.data.single_performances];
      if (this.perfState.preset === '40_PTS') list = list.filter(p => p.pts >= 40);
      else if (this.perfState.preset === 'TRIPLE_DOUBLE') list = list.filter(p => p.triple_double);
      else if (this.perfState.preset === 'DOUBLE_DOUBLE') list = list.filter(p => p.double_double);
      else if (this.perfState.preset === '5_3PM') list = list.filter(p => p.tpm >= 5);
      else if (this.perfState.preset === '15_REB') list = list.filter(p => p.reb >= 15);
      else if (this.perfState.preset === '10_AST') list = list.filter(p => p.ast >= 10);

      if (searchTerm) {
        list = list.filter(p => p.name.toLowerCase().includes(searchTerm) || p.team.toLowerCase().includes(searchTerm));
      }

      const col = this.perfState.sortCol;
      const asc = this.perfState.sortAsc;
      list.sort((a, b) => {
        let valA = a[col.toLowerCase()] ?? a[col];
        let valB = b[col.toLowerCase()] ?? b[col];
        if (col === 'GAME_SCORE') { valA = a.game_score; valB = b.game_score; }
        if (col === 'FG%') { valA = a.fg_pct; valB = b.fg_pct; }
        if (col === '3PM') { valA = a.tpm; valB = b.tpm; }
        if (typeof valA === 'string') return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        return asc ? (valA - valB) : (valB - valA);
      });

      this.paginateAndRender(list, tbody, (p) => `
        <tr>
          <td class="text-left">
            <span class="player-link" onclick="app.openPlayerDossier('${p.name.replace(/'/g, "\\'")}', 'nba')">${p.name}</span>
            ${p.triple_double ? '<span style="font-size: 0.65rem; background: rgba(245,158,11,0.25); color: var(--accent-gold); padding: 1px 5px; border-radius: 4px; margin-left: 4px; font-weight: 800;">TRIPLE-DOUBLE</span>' : ''}
          </td>
          <td>${p.date}</td>
          <td><span style="font-weight: 700; color: ${app.getTeamColor(p.team)};">${p.team}</span></td>
          <td>${p.opp}</td>
          <td>${p.mins}</td>
          <td style="font-weight: 800; color: ${p.pts >= 40 ? 'var(--accent-gold)' : p.pts >= 30 ? 'var(--accent-cyan)' : 'var(--text-primary)'};">${p.pts}</td>
          <td style="font-weight: ${p.reb >= 10 ? '700' : 'normal'};">${p.reb}</td>
          <td style="font-weight: ${p.ast >= 10 ? '700' : 'normal'};">${p.ast}</td>
          <td>${p.stl}</td>
          <td>${p.blk}</td>
          <td>${p.tpm}</td>
          <td>${(p.fg_pct * 100).toFixed(0)}%</td>
          <td style="font-weight: 700; color: var(--accent-gold);">${p.game_score}</td>
        </tr>
      `);
    } else if (sport === 'mlb') {
      const isBat = (this.mlbMode === 'batting');
      if (isBat) {
        tableThead.innerHTML = `
          <th class="text-left" onclick="playersComponent.sortPerfBy('name')">Batter ↕</th>
          <th onclick="playersComponent.sortPerfBy('date')">Date ↕</th>
          <th onclick="playersComponent.sortPerfBy('team')">Team ↕</th>
          <th onclick="playersComponent.sortPerfBy('opp')">Opp ↕</th>
          <th onclick="playersComponent.sortPerfBy('pos')">Pos ↕</th>
          <th onclick="playersComponent.sortPerfBy('ab')">AB ↕</th>
          <th onclick="playersComponent.sortPerfBy('r')">R ↕</th>
          <th onclick="playersComponent.sortPerfBy('h')" style="color: var(--accent-cyan);">Hits ↕</th>
          <th onclick="playersComponent.sortPerfBy('hr')" style="color: var(--accent-gold);">HR ↕</th>
          <th onclick="playersComponent.sortPerfBy('rbi')">RBI ↕</th>
          <th onclick="playersComponent.sortPerfBy('bb')">BB ↕</th>
          <th onclick="playersComponent.sortPerfBy('so')">SO ↕</th>
          <th class="text-left">Details</th>
        `;

        let list = [...(app.data.single_batting || [])];
        if (this.perfState.preset === 'MULTI_HR') list = list.filter(b => b.hr >= 2);
        else if (this.perfState.preset === '3_HITS') list = list.filter(b => b.h >= 3);
        else if (this.perfState.preset === '3_RBI') list = list.filter(b => b.rbi >= 3);

        if (searchTerm) list = list.filter(b => b.name.toLowerCase().includes(searchTerm) || b.team.toLowerCase().includes(searchTerm));

        const col = this.perfState.sortCol.toLowerCase();
        const asc = this.perfState.sortAsc;
        list.sort((a, b) => {
          let valA = a[col] ?? 0;
          let valB = b[col] ?? 0;
          if (typeof valA === 'string') return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
          return asc ? (valA - valB) : (valB - valA);
        });

        this.paginateAndRender(list, tbody, (b) => `
          <tr>
            <td class="text-left"><span class="player-link" onclick="app.openPlayerDossier('${b.name.replace(/'/g, "\\'")}', 'mlb_bat')">${b.name}</span></td>
            <td>${b.date}</td>
            <td><span style="font-weight: 700; color: ${app.getTeamColor(b.team)};">${b.team}</span></td>
            <td>${b.opp}</td>
            <td>${b.pos}</td>
            <td>${b.ab}</td>
            <td>${b.r}</td>
            <td style="font-weight: 700; color: ${b.h >= 3 ? 'var(--accent-cyan)' : 'inherit'};">${b.h}</td>
            <td style="font-weight: 800; color: ${b.hr > 0 ? 'var(--accent-gold)' : 'inherit'};">${b.hr}</td>
            <td style="font-weight: 700;">${b.rbi}</td>
            <td>${b.bb}</td>
            <td>${b.so}</td>
            <td class="text-left" style="font-size: 0.72rem; color: var(--text-muted);">${b.details || '-'}</td>
          </tr>
        `);
      } else {
        tableThead.innerHTML = `
          <th class="text-left" onclick="playersComponent.sortPerfBy('name')">Pitcher ↕</th>
          <th onclick="playersComponent.sortPerfBy('date')">Date ↕</th>
          <th onclick="playersComponent.sortPerfBy('team')">Team ↕</th>
          <th onclick="playersComponent.sortPerfBy('opp')">Opp ↕</th>
          <th onclick="playersComponent.sortPerfBy('ip')">IP ↕</th>
          <th onclick="playersComponent.sortPerfBy('h')">H ↕</th>
          <th onclick="playersComponent.sortPerfBy('r')">R ↕</th>
          <th onclick="playersComponent.sortPerfBy('er')">ER ↕</th>
          <th onclick="playersComponent.sortPerfBy('bb')">BB ↕</th>
          <th onclick="playersComponent.sortPerfBy('so')" style="color: var(--accent-gold);">SO ↕</th>
          <th onclick="playersComponent.sortPerfBy('hr')">HR ↕</th>
          <th onclick="playersComponent.sortPerfBy('pit')">Pitches ↕</th>
          <th onclick="playersComponent.sortPerfBy('gsc')" style="color: var(--accent-cyan);">GameScore ↕</th>
        `;

        let list = [...(app.data.single_pitching || [])];
        if (this.perfState.preset === '10_K') list = list.filter(p => p.so >= 10);
        else if (this.perfState.preset === '7_K') list = list.filter(p => p.so >= 7);
        else if (this.perfState.preset === 'QS') list = list.filter(p => p.ip >= 6.0 && p.er <= 3);

        if (searchTerm) list = list.filter(p => p.name.toLowerCase().includes(searchTerm) || p.team.toLowerCase().includes(searchTerm));

        const col = this.perfState.sortCol.toLowerCase();
        const asc = this.perfState.sortAsc;
        list.sort((a, b) => {
          let valA = a[col] ?? 0;
          let valB = b[col] ?? 0;
          if (typeof valA === 'string') return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
          return asc ? (valA - valB) : (valB - valA);
        });

        this.paginateAndRender(list, tbody, (p) => `
          <tr>
            <td class="text-left"><span class="player-link" onclick="app.openPlayerDossier('${p.name.replace(/'/g, "\\'")}', 'mlb_pitch')">${p.name}</span></td>
            <td>${p.date}</td>
            <td><span style="font-weight: 700; color: ${app.getTeamColor(p.team)};">${p.team}</span></td>
            <td>${p.opp}</td>
            <td style="font-weight: 700;">${p.ip}</td>
            <td>${p.h}</td>
            <td>${p.r}</td>
            <td>${p.er}</td>
            <td>${p.bb}</td>
            <td style="font-weight: 800; color: ${p.so >= 7 ? 'var(--accent-gold)' : 'inherit'};">${p.so}</td>
            <td>${p.hr}</td>
            <td>${p.pit}</td>
            <td style="font-weight: 700; color: var(--accent-cyan);">${p.gsc || '-'}</td>
          </tr>
        `);
      }
    } else if (sport === 'soccer') {
      tableThead.innerHTML = `
        <th class="text-left">Player</th>
        <th>Matches</th>
        <th style="color: var(--accent-gold);">Goals</th>
        <th style="color: var(--accent-cyan);">Assists</th>
        <th>Minutes</th>
        <th>Yellow Cards</th>
        <th>Red Cards</th>
        <th class="text-left">Teams</th>
      `;
      let list = [...(app.data.players || [])];
      if (searchTerm) list = list.filter(p => p.name.toLowerCase().includes(searchTerm) || p.teams.some(t => t.toLowerCase().includes(searchTerm)));

      this.paginateAndRender(list, tbody, (p) => `
        <tr>
          <td class="text-left"><span class="player-link" onclick="app.openPlayerDossier('${p.name.replace(/'/g, "\\'")}', 'soccer')">${p.name}</span></td>
          <td style="font-weight: 700;">${p.matches_count}</td>
          <td style="font-weight: 800; color: ${p.goals > 0 ? 'var(--accent-gold)' : 'inherit'};">${p.goals}</td>
          <td style="font-weight: 700; color: ${p.assists > 0 ? 'var(--accent-cyan)' : 'inherit'};">${p.assists}</td>
          <td>${p.mins}</td>
          <td>${p.yc}</td>
          <td>${p.rc}</td>
          <td class="text-left">${p.teams.join(', ')}</td>
        </tr>
      `);
    }
  },

  paginateAndRender(list, tbody, rowRenderer) {
    const totalCount = list.length;
    const maxPage = Math.max(1, Math.ceil(totalCount / this.perfState.pageSize));
    if (this.perfState.page > maxPage) this.perfState.page = maxPage;
    if (this.perfState.page < 1) this.perfState.page = 1;

    const startIdx = (this.perfState.page - 1) * this.perfState.pageSize;
    const pageItems = list.slice(startIdx, startIdx + this.perfState.pageSize);

    document.getElementById('perf-count-label').textContent = 
      `Showing ${totalCount > 0 ? startIdx + 1 : 0}-${Math.min(startIdx + this.perfState.pageSize, totalCount)} of ${totalCount}`;
    document.getElementById('perf-page-indicator').textContent = `Page ${this.perfState.page} of ${maxPage}`;
    document.getElementById('perf-prev-btn').disabled = (this.perfState.page <= 1);
    document.getElementById('perf-next-btn').disabled = (this.perfState.page >= maxPage);

    tbody.innerHTML = pageItems.map(rowRenderer).join('');
  },

  sortAggBy(col) {
    if (this.aggState.sortCol === col) {
      this.aggState.sortAsc = !this.aggState.sortAsc;
    } else {
      this.aggState.sortCol = col;
      this.aggState.sortAsc = false;
    }
    this.renderAggregates();
  },

  renderAggregates() {
    const tbody = document.getElementById('players-agg-tbody');
    const tableThead = document.querySelector('#players-agg-table thead tr');
    if (!tbody || !app.data) return;

    const sport = app.currentSport;
    const searchTerm = (document.getElementById('player-agg-search')?.value || '').toLowerCase().trim();

    if (sport === 'nba') {
      tableThead.innerHTML = `
        <th class="text-left" onclick="playersComponent.sortAggBy('name')">Player ↕</th>
        <th class="text-left">Teams</th>
        <th onclick="playersComponent.sortAggBy('games_count')">Games ↕</th>
        <th onclick="playersComponent.sortAggBy('win_pct')">Your W-L Record ↕</th>
        <th onclick="playersComponent.sortAggBy('pts')" style="color: var(--accent-cyan);">Total PTS ↕</th>
        <th onclick="playersComponent.sortAggBy('ppg')">PPG ↕</th>
        <th onclick="playersComponent.sortAggBy('reb')">Total REB ↕</th>
        <th onclick="playersComponent.sortAggBy('rpg')">RPG ↕</th>
        <th onclick="playersComponent.sortAggBy('ast')">Total AST ↕</th>
        <th onclick="playersComponent.sortAggBy('apg')">APG ↕</th>
        <th onclick="playersComponent.sortAggBy('tpm')">3PM ↕</th>
        <th onclick="playersComponent.sortAggBy('fg_pct')">FG% ↕</th>
        <th onclick="playersComponent.sortAggBy('triple_doubles')">Tri-Dubs ↕</th>
        <th onclick="playersComponent.sortAggBy('high_pts')" style="color: var(--accent-gold);">Personal High ↕</th>
      `;

      let list = [...app.data.players];
      if (searchTerm) list = list.filter(p => p.name.toLowerCase().includes(searchTerm) || p.teams.some(t => t.toLowerCase().includes(searchTerm)));

      const col = this.aggState.sortCol;
      const asc = this.aggState.sortAsc;
      list.sort((a, b) => {
        let valA = a[col];
        let valB = b[col];
        if (col === 'high_pts') { valA = a.highs.pts; valB = b.highs.pts; }
        if (typeof valA === 'string') return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        return asc ? (valA - valB) : (valB - valA);
      });

      tbody.innerHTML = list.map(p => `
        <tr onclick="app.openPlayerDossier('${p.name.replace(/'/g, "\\'")}', 'nba')" style="cursor: pointer;">
          <td class="text-left"><span class="player-link">${p.name}</span></td>
          <td class="text-left">${p.teams.map(t => `<span style="font-weight: 700; margin-right: 4px; color: ${app.getTeamColor(t)};">${t}</span>`).join('')}</td>
          <td style="font-weight: 700;">${p.games_count}</td>
          <td style="color: ${p.win_pct >= 0.6 ? 'var(--accent-emerald)' : 'var(--text-secondary)'};">${p.wins}-${p.losses}</td>
          <td style="font-weight: 800; color: var(--accent-cyan);">${p.pts}</td>
          <td style="font-weight: 700;">${p.ppg}</td>
          <td>${p.reb}</td>
          <td>${p.rpg}</td>
          <td>${p.ast}</td>
          <td>${p.apg}</td>
          <td>${p.tpm}</td>
          <td>${(p.fg_pct * 100).toFixed(0)}%</td>
          <td>${p.triple_doubles > 0 ? `<strong style="color: var(--accent-gold);">${p.triple_doubles}</strong>` : '-'}</td>
          <td style="font-weight: 700; color: var(--accent-gold);">${p.highs.pts} PTS</td>
        </tr>
      `).join('');
    } else if (sport === 'mlb') {
      tableThead.innerHTML = `
        <th class="text-left" onclick="playersComponent.sortAggBy('name')">Batter ↕</th>
        <th class="text-left">Teams</th>
        <th onclick="playersComponent.sortAggBy('games_count')">Games ↕</th>
        <th onclick="playersComponent.sortAggBy('ab')">AB ↕</th>
        <th onclick="playersComponent.sortAggBy('h')" style="color: var(--accent-cyan);">Hits ↕</th>
        <th onclick="playersComponent.sortAggBy('hr')" style="color: var(--accent-gold);">Home Runs ↕</th>
        <th onclick="playersComponent.sortAggBy('rbi')">RBI ↕</th>
        <th onclick="playersComponent.sortAggBy('r')">Runs ↕</th>
        <th onclick="playersComponent.sortAggBy('avg')">Batting AVG ↕</th>
        <th onclick="playersComponent.sortAggBy('high_hr')">Personal High HR ↕</th>
      `;

      let list = [...(app.data.batters || [])];
      if (searchTerm) list = list.filter(b => b.name.toLowerCase().includes(searchTerm) || b.teams.some(t => t.toLowerCase().includes(searchTerm)));

      const col = this.aggState.sortCol;
      const asc = this.aggState.sortAsc;
      list.sort((a, b) => {
        let valA = a[col] ?? 0;
        let valB = b[col] ?? 0;
        if (typeof valA === 'string') return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        return asc ? (valA - valB) : (valB - valA);
      });

      tbody.innerHTML = list.map(b => `
        <tr onclick="app.openPlayerDossier('${b.name.replace(/'/g, "\\'")}', 'mlb_bat')" style="cursor: pointer;">
          <td class="text-left"><span class="player-link">${b.name}</span></td>
          <td class="text-left">${b.teams.map(t => `<span style="font-weight: 700; margin-right: 4px; color: ${app.getTeamColor(t)};">${t}</span>`).join('')}</td>
          <td style="font-weight: 700;">${b.games_count}</td>
          <td>${b.ab}</td>
          <td style="font-weight: 700; color: var(--accent-cyan);">${b.h}</td>
          <td style="font-weight: 800; color: ${b.hr > 0 ? 'var(--accent-gold)' : 'inherit'}; font-size: 0.95rem;">${b.hr}</td>
          <td style="font-weight: 700;">${b.rbi}</td>
          <td>${b.r}</td>
          <td style="font-weight: 700;">.${(b.avg * 1000).toFixed(0)}</td>
          <td style="font-weight: 700; color: var(--accent-gold);">${b.high_hr} HR</td>
        </tr>
      `).join('');
    } else if (sport === 'soccer') {
      tableThead.innerHTML = `
        <th class="text-left">Player</th>
        <th class="text-left">Teams</th>
        <th>Matches</th>
        <th style="color: var(--accent-gold);">Goals</th>
        <th style="color: var(--accent-cyan);">Assists</th>
        <th>Minutes Played</th>
        <th>Yellow Cards</th>
        <th>Red Cards</th>
      `;

      let list = [...(app.data.players || [])];
      if (searchTerm) list = list.filter(p => p.name.toLowerCase().includes(searchTerm) || p.teams.some(t => t.toLowerCase().includes(searchTerm)));

      tbody.innerHTML = list.map(p => `
        <tr onclick="app.openPlayerDossier('${p.name.replace(/'/g, "\\'")}', 'soccer')" style="cursor: pointer;">
          <td class="text-left"><span class="player-link">${p.name}</span></td>
          <td class="text-left">${p.teams.join(', ')}</td>
          <td style="font-weight: 700;">${p.matches_count}</td>
          <td style="font-weight: 800; color: ${p.goals > 0 ? 'var(--accent-gold)' : 'inherit'};">${p.goals}</td>
          <td style="font-weight: 700; color: ${p.assists > 0 ? 'var(--accent-cyan)' : 'inherit'};">${p.assists}</td>
          <td>${p.mins}</td>
          <td>${p.yc}</td>
          <td>${p.rc}</td>
        </tr>
      `).join('');
    }
  },

  openDossier(playerName, playerType = 'nba') {
    if (playerType === 'nba') {
      const player = (app.rawBundle.nba.players || []).find(p => p.name === playerName);
      if (!player) return;

      document.getElementById('modal-player-title').textContent = player.name;
      document.getElementById('modal-player-subtitle').textContent = 
        `🏀 NBA • Seen Live in Person: ${player.games_count} Games • Teams: ${player.teams.join(', ')} • Record: ${player.wins}-${player.losses}`;

      const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Total Points</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-cyan);">${player.pts}</div><div class="kpi-subtext">${player.ppg} PPG</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Total Rebounds</div><div class="kpi-value" style="font-size: 1.6rem;">${player.reb}</div><div class="kpi-subtext">${player.rpg} RPG</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Total Assists</div><div class="kpi-value" style="font-size: 1.6rem;">${player.ast}</div><div class="kpi-subtext">${player.apg} APG</div></div>
          <div class="kpi-card gold" style="padding: 0.85rem;"><div class="kpi-label">Personal High PTS</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-gold);">${player.highs.pts}</div><div class="kpi-subtext">Single Game</div></div>
        </div>
        <h4 style="font-size: 1rem; font-weight: 800; margin-bottom: 0.75rem;">Complete In-Person Game Log (${player.log.length} Games)</h4>
        <div class="table-responsive">
          <table class="stats-table">
            <thead>
              <tr><th class="text-left">Date</th><th>Team</th><th>Opp</th><th>W/L</th><th>MIN</th><th style="color: var(--accent-cyan);">PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>FG</th><th>3P</th><th style="color: var(--accent-gold);">GameScore</th></tr>
            </thead>
            <tbody>
              ${player.log.map(g => `
                <tr>
                  <td class="text-left">${g.date}</td><td>${g.team}</td><td>${g.opp}</td>
                  <td style="font-weight: 700; color: ${g.wl === 'W' ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${g.wl}</td>
                  <td>${g.mins}</td><td style="font-weight: 700;">${g.pts}</td><td>${g.reb}</td><td>${g.ast}</td><td>${g.stl}</td><td>${g.blk}</td>
                  <td>${g.fgm}-${g.fga}</td><td>${g.tpm}-${g.tpa}</td><td style="font-weight: 700; color: var(--accent-gold);">${g.game_score}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      document.getElementById('modal-player-body').innerHTML = html;
      document.getElementById('player-modal').classList.add('active');
    } else if (playerType === 'mlb_bat') {
      const player = (app.rawBundle.mlb.batters || []).find(b => b.name === playerName);
      if (!player) return;

      document.getElementById('modal-player-title').textContent = player.name;
      document.getElementById('modal-player-subtitle').textContent = 
        `⚾ MLB Batter • Seen Live in Person: ${player.games_count} Games • Teams: ${player.teams.join(', ')}`;

      const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
          <div class="kpi-card gold" style="padding: 0.85rem;"><div class="kpi-label">Home Runs</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-gold);">${player.hr}</div><div class="kpi-subtext">Witnessed Live</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Hits</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-cyan);">${player.h}</div><div class="kpi-subtext">Across ${player.ab} At-Bats</div></div>
          <div class="kpi-card emerald" style="padding: 0.85rem;"><div class="kpi-label">Batting Average</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-emerald);">.${(player.avg * 1000).toFixed(0)}</div><div class="kpi-subtext">OBP: .${(player.obp * 1000).toFixed(0)}</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">RBIs & Runs</div><div class="kpi-value" style="font-size: 1.6rem;">${player.rbi} <span style="font-size: 1rem; color: var(--text-muted);">/ ${player.r} R</span></div><div class="kpi-subtext">Runs Produced</div></div>
        </div>
        <h4 style="font-size: 1rem; font-weight: 800; margin-bottom: 0.75rem;">Complete In-Person Batting Log (${player.log.length} Games)</h4>
        <div class="table-responsive">
          <table class="stats-table">
            <thead>
              <tr><th class="text-left">Date</th><th>Team</th><th>Opp</th><th>Pos</th><th>AB</th><th>R</th><th style="color: var(--accent-cyan);">H</th><th style="color: var(--accent-gold);">HR</th><th>RBI</th><th>BB</th><th>SO</th></tr>
            </thead>
            <tbody>
              ${player.log.map(g => `
                <tr>
                  <td class="text-left">${g.date}</td><td>${g.team}</td><td>${g.opp}</td><td>${g.pos}</td>
                  <td>${g.ab}</td><td>${g.r}</td><td style="font-weight: 700;">${g.h}</td>
                  <td style="font-weight: 800; color: ${g.hr > 0 ? 'var(--accent-gold)' : 'inherit'};">${g.hr}</td>
                  <td style="font-weight: 700;">${g.rbi}</td><td>${g.bb}</td><td>${g.so}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      document.getElementById('modal-player-body').innerHTML = html;
      document.getElementById('player-modal').classList.add('active');
    } else if (playerType === 'mlb_pitch') {
      const player = (app.rawBundle.mlb.pitchers || []).find(p => p.name === playerName);
      if (!player) return;

      document.getElementById('modal-player-title').textContent = player.name;
      document.getElementById('modal-player-subtitle').textContent = 
        `⚾ MLB Pitcher • Seen Live in Person: ${player.games_count} Outings • Teams: ${player.teams.join(', ')}`;

      const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
          <div class="kpi-card gold" style="padding: 0.85rem;"><div class="kpi-label">Strikeouts</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-gold);">${player.so}</div><div class="kpi-subtext">Total Ks in Person</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Innings Pitched</div><div class="kpi-value" style="font-size: 1.6rem;">${player.ip}</div><div class="kpi-subtext">Across ${player.games_count} Outings</div></div>
          <div class="kpi-card emerald" style="padding: 0.85rem;"><div class="kpi-label">ERA</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-emerald);">${player.era}</div><div class="kpi-subtext">WHIP: ${player.whip}</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Personal High SO</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-cyan);">${player.high_so} K</div><div class="kpi-subtext">Single Game</div></div>
        </div>
        <h4 style="font-size: 1rem; font-weight: 800; margin-bottom: 0.75rem;">Complete In-Person Pitching Log (${player.log.length} Outings)</h4>
        <div class="table-responsive">
          <table class="stats-table">
            <thead>
              <tr><th class="text-left">Date</th><th>Team</th><th>Opp</th><th>IP</th><th>H</th><th>R</th><th>ER</th><th>BB</th><th style="color: var(--accent-gold);">SO</th><th>HR</th><th>Pitches</th></tr>
            </thead>
            <tbody>
              ${player.log.map(g => `
                <tr>
                  <td class="text-left">${g.date}</td><td>${g.team}</td><td>${g.opp}</td><td style="font-weight: 700;">${g.ip}</td>
                  <td>${g.h}</td><td>${g.r}</td><td>${g.er}</td><td>${g.bb}</td>
                  <td style="font-weight: 800; color: ${g.so >= 7 ? 'var(--accent-gold)' : 'inherit'};">${g.so}</td>
                  <td>${g.hr}</td><td>${g.pit}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      document.getElementById('modal-player-body').innerHTML = html;
      document.getElementById('player-modal').classList.add('active');
    } else if (playerType === 'soccer') {
      const player = (app.rawBundle.soccer.players || []).find(p => p.name === playerName);
      if (!player) return;

      document.getElementById('modal-player-title').textContent = player.name;
      document.getElementById('modal-player-subtitle').textContent = 
        `⚽ Football Player • Seen in ${player.matches_count} Matches • Teams: ${player.teams.join(', ')}`;

      const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
          <div class="kpi-card gold" style="padding: 0.85rem;"><div class="kpi-label">Goals</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-gold);">${player.goals}</div><div class="kpi-subtext">Scored Live</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Assists</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-cyan);">${player.assists}</div><div class="kpi-subtext">Assists Recorded</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Minutes Played</div><div class="kpi-value" style="font-size: 1.6rem;">${player.mins}</div><div class="kpi-subtext">Across ${player.matches_count} Matches</div></div>
        </div>
        <h4 style="font-size: 1rem; font-weight: 800; margin-bottom: 0.75rem;">Match Appearances (${player.log.length} Matches)</h4>
        <div class="table-responsive">
          <table class="stats-table">
            <thead>
              <tr><th class="text-left">Date</th><th>Team</th><th>Opp</th><th>Pos</th><th>MIN</th><th>Goals</th><th>Assists</th><th>YC</th><th>RC</th></tr>
            </thead>
            <tbody>
              ${player.log.map(g => `
                <tr>
                  <td class="text-left">${g.date}</td><td>${g.team}</td><td>${g.opp}</td><td>${g.pos}</td>
                  <td>${g.mins}</td><td style="font-weight: 700; color: ${g.goals > 0 ? 'var(--accent-gold)' : 'inherit'};">${g.goals}</td>
                  <td style="font-weight: 700;">${g.assists}</td><td>${g.yc}</td><td>${g.rc}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      document.getElementById('modal-player-body').innerHTML = html;
      document.getElementById('player-modal').classList.add('active');
    }
  }
};
