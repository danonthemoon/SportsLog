// players.js - Performance Leaderboard and Player Aggregates (NBA, MLB, Soccer)
const playersComponent = {
  mlbMode: 'batting', // 'batting' or 'pitching'
  perfState: {
    sortCol: 'PTS',
    sortAsc: false,
    preset: 'ALL',
    page: 1,
    pageSize: 100,
  },
  aggState: {
    sortCol: 'pts',
    sortAsc: false,
    page: 1,
    pageSize: 100,
  },
  changeAggPage(delta) {
    this.aggState.page += delta;
    this.renderAggregates();
  },
  dossierState: {
    player: null,
    playerType: null,
    sortCol: 'date',
    sortAsc: false,
    log: []
  },

  getCaliberBadge(p, sport = app.currentSport) {
    if (!p) return '';
    if (p.is_mvp) {
      const txt = (sport === 'mlb_pitch' || (sport === 'mlb' && p.ip !== undefined)) ? '🏆 CY/MVP' : '🏆 MVP';
      return `<span class="caliber-badge mvp">${txt}</span>`;
    }
    if (p.is_all_nba) {
      const txt = sport === 'nba' ? '🎖️ All-NBA' : (sport === 'mlb' || sport === 'mlb_bat' || sport === 'mlb_pitch') ? '🎖️ All-MLB' : '🎖️ World XI';
      return `<span class="caliber-badge all-nba">${txt}</span>`;
    }
    if (p.is_all_star) {
      return `<span class="caliber-badge all-star">⭐ All-Star</span>`;
    }
    return '';
  },

  renderPresets() {
    const container = document.getElementById('perf-presets-container');
    if (!container) return;

    const sport = app.currentSport;
    let html = `<span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-cyan);">Quick Presets:</span>`;

    if (sport === 'nba') {
      const presets = [
        { id: 'ALL', label: 'All Performances' },
        { id: '40_PTS', label: '🔥 40+ PTS' },
        { id: 'TRIPLE_DOUBLE', label: '👑 Triple-Doubles' },
        { id: 'DOUBLE_DOUBLE', label: '⚡ Double-Doubles' },
        { id: '5_3PM', label: '🎯 5+ 3-Pointers' },
        { id: '15_REB', label: '🦾 15+ Rebounds' },
        { id: '10_AST', label: '🪄 10+ Assists' },
        { id: 'MVP', label: '🏆 League MVPs' },
        { id: 'ALL_STAR', label: '⭐ All-Stars & All-NBA' },
      ];
      html += presets.map(p => `
        <button class="chip-btn ${this.perfState.preset === p.id ? 'active' : ''}" onclick="playersComponent.setPerfPreset('${p.id}')">${p.label}</button>
      `).join('');
    } else if (sport === 'mlb') {
      html += `
        <div style="display: inline-flex; background: rgba(255,255,255,0.06); border-radius: var(--radius-sm); padding: 2px; margin-right: 0.5rem;">
          <button class="chip-btn ${this.mlbMode === 'batting' ? 'active' : ''}" style="margin: 0;" onclick="playersComponent.setMlbMode('batting')">Batting</button>
          <button class="chip-btn ${this.mlbMode === 'pitching' ? 'active' : ''}" style="margin: 0;" onclick="playersComponent.setMlbMode('pitching')">Pitching</button>
        </div>
      `;
      if (this.mlbMode === 'batting') {
        const presets = [
          { id: 'ALL', label: 'All Batters' },
          { id: 'MULTI_HR', label: '💥 Multi-HR (2+ HR)' },
          { id: '3_HITS', label: '⚾ 3+ Hits' },
          { id: '3_RBI', label: '🚀 3+ RBIs' },
          { id: 'MVP', label: '🏆 League MVPs' },
          { id: 'ALL_STAR', label: '⭐ All-Stars' },
        ];
        html += presets.map(p => `
          <button class="chip-btn ${this.perfState.preset === p.id ? 'active' : ''}" onclick="playersComponent.setPerfPreset('${p.id}')">${p.label}</button>
        `).join('');
      } else {
        const presets = [
          { id: 'ALL', label: 'All Pitchers' },
          { id: '10_K', label: '⚡ 10+ Strikeouts' },
          { id: '7_K', label: '🔥 7+ Strikeouts' },
          { id: 'QS', label: '💎 Quality Starts' },
          { id: 'MVP', label: '🏆 Cy Young & MVPs' },
          { id: 'ALL_STAR', label: '⭐ All-Stars' },
        ];
        html += presets.map(p => `
          <button class="chip-btn ${this.perfState.preset === p.id ? 'active' : ''}" onclick="playersComponent.setPerfPreset('${p.id}')">${p.label}</button>
        `).join('');
      }
    } else if (sport === 'soccer') {
      const presets = [
        { id: 'ALL', label: 'All Players' },
        { id: 'GOALS', label: '⚽ Goalscorers' },
        { id: 'MULTI_GOAL', label: '🎯 Multi-Goal (2+ Goals)' },
        { id: 'ASSISTS', label: '🪄 Playmakers (Assists)' },
        { id: 'CARDS', label: '🟨 Card Magnet' },
        { id: 'MVP', label: '🏆 World Stars & MVPs' },
      ];
      html += presets.map(p => `
        <button class="chip-btn ${this.perfState.preset === p.id ? 'active' : ''}" onclick="playersComponent.setPerfPreset('${p.id}')">${p.label}</button>
      `).join('');
    }

    container.innerHTML = html;
  },

  setMlbMode(mode) {
    this.mlbMode = mode;
    this.perfState.preset = 'ALL';
    this.perfState.page = 1;
    this.perfState.sortCol = (mode === 'batting' ? 'h' : 'so');
    this.renderPresets();
    this.renderLeaderboard();
  },

  setPerfPreset(preset) {
    this.perfState.preset = preset;
    this.perfState.page = 1;
    this.renderPresets();
    this.renderLeaderboard();
  },

  sortPerfBy(col) {
    if (this.perfState.sortCol.toUpperCase() === col.toUpperCase()) {
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

  getSortIndicator(activeCol, col) {
    if (activeCol.toUpperCase() === col.toUpperCase()) {
      return this.perfState.sortAsc ? ' ▲' : ' ▼';
    }
    return ' ↕';
  },

  getAggSortIndicator(activeCol, col) {
    if (activeCol.toUpperCase() === col.toUpperCase()) {
      return this.aggState.sortAsc ? ' ▲' : ' ▼';
    }
    return ' ↕';
  },

  renderLeaderboard() {
    this.renderPresets();
    const tbody = document.getElementById('performances-tbody');
    const tableThead = document.querySelector('#performances-table thead tr');
    if (!tbody || !app.data) return;

    const sport = app.currentSport;
    const searchTerm = (document.getElementById('perf-search-input')?.value || '').toLowerCase().trim();
    const activeCol = this.perfState.sortCol;

    if (sport === 'nba') {
      const getThClass = (col) => (activeCol.toUpperCase() === col.toUpperCase() ? 'sorted-active' : '');
      const ind = (col) => this.getSortIndicator(activeCol, col);

      tableThead.innerHTML = `
        <th class="text-left ${getThClass('NAME')}" onclick="playersComponent.sortPerfBy('NAME')">Player${ind('NAME')}</th>
        <th class="${getThClass('DATE')}" onclick="playersComponent.sortPerfBy('DATE')">Date${ind('DATE')}</th>
        <th class="${getThClass('TEAM')}" onclick="playersComponent.sortPerfBy('TEAM')">Team${ind('TEAM')}</th>
        <th class="${getThClass('OPP')}" onclick="playersComponent.sortPerfBy('OPP')">Opp${ind('OPP')}</th>
        <th class="${getThClass('MINS')}" onclick="playersComponent.sortPerfBy('MINS')">MIN${ind('MINS')}</th>
        <th class="${getThClass('PTS')}" onclick="playersComponent.sortPerfBy('PTS')" style="color: var(--accent-cyan);">PTS${ind('PTS')}</th>
        <th class="${getThClass('REB')}" onclick="playersComponent.sortPerfBy('REB')">REB${ind('REB')}</th>
        <th class="${getThClass('AST')}" onclick="playersComponent.sortPerfBy('AST')">AST${ind('AST')}</th>
        <th class="${getThClass('STL')}" onclick="playersComponent.sortPerfBy('STL')">STL${ind('STL')}</th>
        <th class="${getThClass('BLK')}" onclick="playersComponent.sortPerfBy('BLK')">BLK${ind('BLK')}</th>
        <th class="${getThClass('3PM')}" onclick="playersComponent.sortPerfBy('3PM')">3PM${ind('3PM')}</th>
        <th class="${getThClass('FG%')}" onclick="playersComponent.sortPerfBy('FG%')">FG%${ind('FG%')}</th>
        <th class="${getThClass('GAME_SCORE')}" onclick="playersComponent.sortPerfBy('GAME_SCORE')" style="color: var(--accent-gold);">GameScore${ind('GAME_SCORE')}</th>
      `;

      let list = [...app.data.single_performances];
      if (this.perfState.preset === '40_PTS') list = list.filter(p => p.pts >= 40);
      else if (this.perfState.preset === 'TRIPLE_DOUBLE') list = list.filter(p => p.triple_double);
      else if (this.perfState.preset === 'DOUBLE_DOUBLE') list = list.filter(p => p.double_double);
      else if (this.perfState.preset === '5_3PM') list = list.filter(p => p.tpm >= 5);
      else if (this.perfState.preset === '15_REB') list = list.filter(p => p.reb >= 15);
      else if (this.perfState.preset === '10_AST') list = list.filter(p => p.ast >= 10);
      else if (this.perfState.preset === 'MVP') list = list.filter(p => p.is_mvp);
      else if (this.perfState.preset === 'ALL_STAR') list = list.filter(p => p.is_all_star || p.is_all_nba || p.is_mvp);

      if (searchTerm) {
        list = list.filter(p => p.name.toLowerCase().includes(searchTerm) || p.team.toLowerCase().includes(searchTerm));
      }

      const col = this.perfState.sortCol.toUpperCase();
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

      const getTdClass = (c) => (col === c ? 'sorted-active-cell' : '');

      this.paginateAndRender(list, tbody, (p) => `
        <tr>
          <td class="text-left ${getTdClass('NAME')}">
            <span class="player-link" onclick="app.openPlayerDossier('${p.name.replace(/'/g, "\\'")}', 'nba')">${p.name}</span>
            ${this.getCaliberBadge(p, 'nba')}
            ${p.triple_double ? '<span style="font-size: 0.65rem; background: rgba(245,158,11,0.25); color: var(--accent-gold); padding: 1px 5px; border-radius: 4px; margin-left: 4px; font-weight: 800;">TRIPLE-DOUBLE</span>' : ''}
          </td>
          <td class="${getTdClass('DATE')}">${p.date}</td>
          <td class="${getTdClass('TEAM')}"><span style="font-weight: 700; color: ${app.getTeamColor(p.team)};">${p.team}</span></td>
          <td class="${getTdClass('OPP')}">${p.opp}</td>
          <td class="${getTdClass('MINS')}">${p.mins}</td>
          <td class="${getTdClass('PTS')}" style="font-weight: 800; color: ${p.pts >= 40 ? 'var(--accent-gold)' : p.pts >= 30 ? 'var(--accent-cyan)' : 'var(--text-primary)'};">${p.pts}</td>
          <td class="${getTdClass('REB')}" style="font-weight: ${p.reb >= 10 ? '700' : 'normal'};">${p.reb}</td>
          <td class="${getTdClass('AST')}" style="font-weight: ${p.ast >= 10 ? '700' : 'normal'};">${p.ast}</td>
          <td class="${getTdClass('STL')}">${p.stl}</td>
          <td class="${getTdClass('BLK')}">${p.blk}</td>
          <td class="${getTdClass('3PM')}">${p.tpm}</td>
          <td class="${getTdClass('FG%')}">${(p.fg_pct * 100).toFixed(0)}%</td>
          <td class="${getTdClass('GAME_SCORE')}" style="font-weight: 700; color: var(--accent-gold);">${p.game_score}</td>
        </tr>
      `);
    } else if (sport === 'mlb') {
      const isBat = (this.mlbMode === 'batting');
      const getThClass = (col) => (activeCol.toLowerCase() === col.toLowerCase() ? 'sorted-active' : '');
      const ind = (col) => this.getSortIndicator(activeCol, col);
      const getTdClass = (c) => (activeCol.toLowerCase() === c.toLowerCase() ? 'sorted-active-cell' : '');

      if (isBat) {
        tableThead.innerHTML = `
          <th class="text-left ${getThClass('name')}" onclick="playersComponent.sortPerfBy('name')">Batter${ind('name')}</th>
          <th class="${getThClass('date')}" onclick="playersComponent.sortPerfBy('date')">Date${ind('date')}</th>
          <th class="${getThClass('team')}" onclick="playersComponent.sortPerfBy('team')">Team${ind('team')}</th>
          <th class="${getThClass('opp')}" onclick="playersComponent.sortPerfBy('opp')">Opp${ind('opp')}</th>
          <th class="${getThClass('pos')}" onclick="playersComponent.sortPerfBy('pos')">Pos${ind('pos')}</th>
          <th class="${getThClass('ab')}" onclick="playersComponent.sortPerfBy('ab')">AB${ind('ab')}</th>
          <th class="${getThClass('r')}" onclick="playersComponent.sortPerfBy('r')">R${ind('r')}</th>
          <th class="${getThClass('h')}" onclick="playersComponent.sortPerfBy('h')" style="color: var(--accent-cyan);">Hits${ind('h')}</th>
          <th class="${getThClass('hr')}" onclick="playersComponent.sortPerfBy('hr')" style="color: var(--accent-gold);">HR${ind('hr')}</th>
          <th class="${getThClass('rbi')}" onclick="playersComponent.sortPerfBy('rbi')">RBI${ind('rbi')}</th>
          <th class="${getThClass('bb')}" onclick="playersComponent.sortPerfBy('bb')">BB${ind('bb')}</th>
          <th class="${getThClass('so')}" onclick="playersComponent.sortPerfBy('so')">SO${ind('so')}</th>
          <th class="text-left">Details</th>
        `;

        let list = [...(app.data.single_batting || [])];
        if (this.perfState.preset === 'MULTI_HR') list = list.filter(b => b.hr >= 2);
        else if (this.perfState.preset === '3_HITS') list = list.filter(b => b.h >= 3);
        else if (this.perfState.preset === '3_RBI') list = list.filter(b => b.rbi >= 3);
        else if (this.perfState.preset === 'MVP') list = list.filter(b => b.is_mvp);
        else if (this.perfState.preset === 'ALL_STAR') list = list.filter(b => b.is_all_star || b.is_all_nba || b.is_mvp);

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
            <td class="text-left ${getTdClass('name')}">
              <span class="player-link" onclick="app.openPlayerDossier('${b.name.replace(/'/g, "\\'")}', 'mlb_bat')">${b.name}</span>
              ${this.getCaliberBadge(b, 'mlb_bat')}
            </td>
            <td class="${getTdClass('date')}">${b.date}</td>
            <td class="${getTdClass('team')}"><span style="font-weight: 700; color: ${app.getTeamColor(b.team)};">${b.team}</span></td>
            <td class="${getTdClass('opp')}">${b.opp}</td>
            <td class="${getTdClass('pos')}">${b.pos}</td>
            <td class="${getTdClass('ab')}">${b.ab}</td>
            <td class="${getTdClass('r')}">${b.r}</td>
            <td class="${getTdClass('h')}" style="font-weight: 700; color: ${b.h >= 3 ? 'var(--accent-cyan)' : 'inherit'};">${b.h}</td>
            <td class="${getTdClass('hr')}" style="font-weight: 800; color: ${b.hr > 0 ? 'var(--accent-gold)' : 'inherit'};">${b.hr}</td>
            <td class="${getTdClass('rbi')}" style="font-weight: 700;">${b.rbi}</td>
            <td class="${getTdClass('bb')}">${b.bb}</td>
            <td class="${getTdClass('so')}">${b.so}</td>
            <td class="text-left" style="font-size: 0.72rem; color: var(--text-muted);">${b.details || '-'}</td>
          </tr>
        `);
      } else {
        tableThead.innerHTML = `
          <th class="text-left ${getThClass('name')}" onclick="playersComponent.sortPerfBy('name')">Pitcher${ind('name')}</th>
          <th class="${getThClass('date')}" onclick="playersComponent.sortPerfBy('date')">Date${ind('date')}</th>
          <th class="${getThClass('team')}" onclick="playersComponent.sortPerfBy('team')">Team${ind('team')}</th>
          <th class="${getThClass('opp')}" onclick="playersComponent.sortPerfBy('opp')">Opp${ind('opp')}</th>
          <th class="${getThClass('ip')}" onclick="playersComponent.sortPerfBy('ip')">IP${ind('ip')}</th>
          <th class="${getThClass('h')}" onclick="playersComponent.sortPerfBy('h')">H${ind('h')}</th>
          <th class="${getThClass('r')}" onclick="playersComponent.sortPerfBy('r')">R${ind('r')}</th>
          <th class="${getThClass('er')}" onclick="playersComponent.sortPerfBy('er')">ER${ind('er')}</th>
          <th class="${getThClass('bb')}" onclick="playersComponent.sortPerfBy('bb')">BB${ind('bb')}</th>
          <th class="${getThClass('so')}" onclick="playersComponent.sortPerfBy('so')" style="color: var(--accent-gold);">SO${ind('so')}</th>
          <th class="${getThClass('hr')}" onclick="playersComponent.sortPerfBy('hr')">HR${ind('hr')}</th>
          <th class="${getThClass('pit')}" onclick="playersComponent.sortPerfBy('pit')">Pitches${ind('pit')}</th>
          <th class="${getThClass('gsc')}" onclick="playersComponent.sortPerfBy('gsc')" style="color: var(--accent-cyan);">GameScore${ind('gsc')}</th>
        `;

        let list = [...(app.data.single_pitching || [])];
        if (this.perfState.preset === '10_K') list = list.filter(p => p.so >= 10);
        else if (this.perfState.preset === '7_K') list = list.filter(p => p.so >= 7);
        else if (this.perfState.preset === 'QS') list = list.filter(p => p.ip >= 6.0 && p.er <= 3);
        else if (this.perfState.preset === 'MVP') list = list.filter(p => p.is_mvp);
        else if (this.perfState.preset === 'ALL_STAR') list = list.filter(p => p.is_all_star || p.is_all_nba || p.is_mvp);

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
            <td class="text-left ${getTdClass('name')}">
              <span class="player-link" onclick="app.openPlayerDossier('${p.name.replace(/'/g, "\\'")}', 'mlb_pitch')">${p.name}</span>
              ${this.getCaliberBadge(p, 'mlb_pitch')}
            </td>
            <td class="${getTdClass('date')}">${p.date}</td>
            <td class="${getTdClass('team')}"><span style="font-weight: 700; color: ${app.getTeamColor(p.team)};">${p.team}</span></td>
            <td class="${getTdClass('opp')}">${p.opp}</td>
            <td class="${getTdClass('ip')}" style="font-weight: 700;">${p.ip}</td>
            <td class="${getTdClass('h')}">${p.h}</td>
            <td class="${getTdClass('r')}">${p.r}</td>
            <td class="${getTdClass('er')}">${p.er}</td>
            <td class="${getTdClass('bb')}">${p.bb}</td>
            <td class="${getTdClass('so')}" style="font-weight: 800; color: ${p.so >= 7 ? 'var(--accent-gold)' : 'inherit'};">${p.so}</td>
            <td class="${getTdClass('hr')}">${p.hr}</td>
            <td class="${getTdClass('pit')}">${p.pit}</td>
            <td class="${getTdClass('gsc')}" style="font-weight: 700; color: var(--accent-cyan);">${p.gsc || '-'}</td>
          </tr>
        `);
      }
    } else if (sport === 'soccer') {
      const getThClass = (col) => (activeCol.toLowerCase() === col.toLowerCase() ? 'sorted-active' : '');
      const ind = (col) => this.getSortIndicator(activeCol, col);
      const getTdClass = (c) => (activeCol.toLowerCase() === c.toLowerCase() ? 'sorted-active-cell' : '');

      tableThead.innerHTML = `
        <th class="text-left ${getThClass('name')}" onclick="playersComponent.sortPerfBy('name')">Player${ind('name')}</th>
        <th class="${getThClass('matches_count')}" onclick="playersComponent.sortPerfBy('matches_count')">Matches${ind('matches_count')}</th>
        <th class="${getThClass('goals')}" onclick="playersComponent.sortPerfBy('goals')" style="color: var(--accent-gold);">Goals${ind('goals')}</th>
        <th class="${getThClass('assists')}" onclick="playersComponent.sortPerfBy('assists')" style="color: var(--accent-cyan);">Assists${ind('assists')}</th>
        <th class="${getThClass('mins')}" onclick="playersComponent.sortPerfBy('mins')">Minutes${ind('mins')}</th>
        <th class="${getThClass('yc')}" onclick="playersComponent.sortPerfBy('yc')">Yellow Cards${ind('yc')}</th>
        <th class="${getThClass('rc')}" onclick="playersComponent.sortPerfBy('rc')">Red Cards${ind('rc')}</th>
        <th class="text-left">Teams</th>
      `;
      let list = [...(app.data.players || [])];
      if (this.perfState.preset === 'GOALS') list = list.filter(p => p.goals > 0);
      else if (this.perfState.preset === 'MULTI_GOAL') list = list.filter(p => p.goals >= 2);
      else if (this.perfState.preset === 'ASSISTS') list = list.filter(p => p.assists > 0);
      else if (this.perfState.preset === 'CARDS') list = list.filter(p => p.yc > 0 || p.rc > 0);
      else if (this.perfState.preset === 'MVP') list = list.filter(p => p.is_mvp);
      else if (this.perfState.preset === 'ALL_STAR') list = list.filter(p => p.is_all_star || p.is_all_nba || p.is_mvp);

      if (searchTerm) list = list.filter(p => p.name.toLowerCase().includes(searchTerm) || p.teams.some(t => t.toLowerCase().includes(searchTerm)));

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
          <td class="text-left ${getTdClass('name')}">
            <span class="player-link" onclick="app.openPlayerDossier('${p.name.replace(/'/g, "\\'")}', 'soccer')">${p.name}</span>
            ${this.getCaliberBadge(p, 'soccer')}
          </td>
          <td class="${getTdClass('matches_count')}" style="font-weight: 700;">${p.matches_count}</td>
          <td class="${getTdClass('goals')}" style="font-weight: 800; color: ${p.goals > 0 ? 'var(--accent-gold)' : 'inherit'};">${p.goals}</td>
          <td class="${getTdClass('assists')}" style="font-weight: 700; color: ${p.assists > 0 ? 'var(--accent-cyan)' : 'inherit'};">${p.assists}</td>
          <td class="${getTdClass('mins')}">${p.mins}</td>
          <td class="${getTdClass('yc')}">${p.yc}</td>
          <td class="${getTdClass('rc')}">${p.rc}</td>
          <td class="text-left">${p.teams.join(', ')}</td>
        </tr>
      `);
    }
  },

  paginateAndRender(list, tbody, rowRenderer) {
    const totalCount = list.length;
    const pageSize = totalCount <= 200 ? totalCount : 100;
    this.perfState.pageSize = pageSize;
    const maxPage = Math.max(1, Math.ceil(totalCount / pageSize));
    if (this.perfState.page > maxPage) this.perfState.page = maxPage;
    if (this.perfState.page < 1) this.perfState.page = 1;

    const startIdx = (this.perfState.page - 1) * pageSize;
    const pageItems = list.slice(startIdx, startIdx + pageSize);

    const countLabel = document.getElementById('perf-count-label');
    if (countLabel) {
      countLabel.textContent = `Showing ${totalCount > 0 ? startIdx + 1 : 0}-${Math.min(startIdx + pageSize, totalCount)} of ${totalCount}`;
    }

    const prevBtn = document.getElementById('perf-prev-btn');
    const nextBtn = document.getElementById('perf-next-btn');
    const indicator = document.getElementById('perf-page-indicator');
    const paginationControls = document.getElementById('perf-pagination-controls');

    if (maxPage <= 1) {
      if (paginationControls) paginationControls.style.display = 'none';
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (indicator) indicator.style.display = 'none';
    } else {
      if (paginationControls) paginationControls.style.display = 'flex';
      if (indicator) {
        indicator.style.display = 'inline-block';
        indicator.textContent = `Page ${this.perfState.page} of ${maxPage}`;
      }
      if (prevBtn) {
        prevBtn.style.display = (this.perfState.page <= 1) ? 'none' : 'inline-block';
        prevBtn.disabled = (this.perfState.page <= 1);
      }
      if (nextBtn) {
        nextBtn.style.display = (this.perfState.page >= maxPage) ? 'none' : 'inline-block';
        nextBtn.disabled = (this.perfState.page >= maxPage);
      }
    }

    tbody.innerHTML = pageItems.map(rowRenderer).join('');
  },

  paginateAgg(list, tbody, rowRenderer) {
    const totalCount = list.length;
    const pageSize = totalCount <= 200 ? totalCount : 100;
    this.aggState.pageSize = pageSize;
    const maxPage = Math.max(1, Math.ceil(totalCount / pageSize));
    if (this.aggState.page > maxPage) this.aggState.page = maxPage;
    if (this.aggState.page < 1) this.aggState.page = 1;

    const startIdx = (this.aggState.page - 1) * pageSize;
    const pageItems = list.slice(startIdx, startIdx + pageSize);

    const countLabel = document.getElementById('agg-count-label');
    if (countLabel) {
      countLabel.textContent = `Showing ${totalCount > 0 ? startIdx + 1 : 0}-${Math.min(startIdx + pageSize, totalCount)} of ${totalCount}`;
    }

    const prevBtn = document.getElementById('agg-prev-btn');
    const nextBtn = document.getElementById('agg-next-btn');
    const indicator = document.getElementById('agg-page-indicator');
    const paginationControls = document.getElementById('agg-pagination-controls');

    if (maxPage <= 1) {
      if (paginationControls) paginationControls.style.display = 'none';
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (indicator) indicator.style.display = 'none';
    } else {
      if (paginationControls) paginationControls.style.display = 'flex';
      if (indicator) {
        indicator.style.display = 'inline-block';
        indicator.textContent = `Page ${this.aggState.page} of ${maxPage}`;
      }
      if (prevBtn) {
        prevBtn.style.display = (this.aggState.page <= 1) ? 'none' : 'inline-block';
        prevBtn.disabled = (this.aggState.page <= 1);
      }
      if (nextBtn) {
        nextBtn.style.display = (this.aggState.page >= maxPage) ? 'none' : 'inline-block';
        nextBtn.disabled = (this.aggState.page >= maxPage);
      }
    }

    tbody.innerHTML = pageItems.map(rowRenderer).join('');
  },

  sortAggBy(col) {
    if (this.aggState.sortCol.toUpperCase() === col.toUpperCase()) {
      this.aggState.sortAsc = !this.aggState.sortAsc;
    } else {
      this.aggState.sortCol = col;
      this.aggState.sortAsc = false;
    }
    this.aggState.page = 1;
    this.renderAggregates();
  },

  renderAggregates() {
    const tbody = document.getElementById('players-agg-tbody');
    const tableThead = document.querySelector('#players-agg-table thead tr');
    if (!tbody || !app.data) return;

    const sport = app.currentSport;
    const searchTerm = (document.getElementById('player-agg-search')?.value || '').toLowerCase().trim();
    const caliberFilter = document.getElementById('player-caliber-filter')?.value || 'ALL';
    const minGames = parseInt(document.getElementById('player-min-games')?.value || '1', 10);
    const activeCol = this.aggState.sortCol;

    const getThClass = (col) => (activeCol.toUpperCase() === col.toUpperCase() ? 'sorted-active' : '');
    const ind = (col) => this.getAggSortIndicator(activeCol, col);
    const getTdClass = (c) => (activeCol.toUpperCase() === c.toUpperCase() ? 'sorted-active-cell' : '');

    if (sport === 'nba') {
      tableThead.innerHTML = `
        <th class="text-left ${getThClass('name')}" onclick="playersComponent.sortAggBy('name')">Player${ind('name')}</th>
        <th class="text-left">Teams</th>
        <th class="${getThClass('games_count')}" onclick="playersComponent.sortAggBy('games_count')">Games${ind('games_count')}</th>
        <th class="${getThClass('win_pct')}" onclick="playersComponent.sortAggBy('win_pct')">Your W-L Record${ind('win_pct')}</th>
        <th class="${getThClass('pts')}" onclick="playersComponent.sortAggBy('pts')" style="color: var(--accent-cyan);">Total PTS${ind('pts')}</th>
        <th class="${getThClass('ppg')}" onclick="playersComponent.sortAggBy('ppg')">PPG${ind('ppg')}</th>
        <th class="${getThClass('reb')}" onclick="playersComponent.sortAggBy('reb')">Total REB${ind('reb')}</th>
        <th class="${getThClass('rpg')}" onclick="playersComponent.sortAggBy('rpg')">RPG${ind('rpg')}</th>
        <th class="${getThClass('ast')}" onclick="playersComponent.sortAggBy('ast')">Total AST${ind('ast')}</th>
        <th class="${getThClass('apg')}" onclick="playersComponent.sortAggBy('apg')">APG${ind('apg')}</th>
        <th class="${getThClass('tpm')}" onclick="playersComponent.sortAggBy('tpm')">3PM${ind('tpm')}</th>
        <th class="${getThClass('fg_pct')}" onclick="playersComponent.sortAggBy('fg_pct')">FG%${ind('fg_pct')}</th>
        <th class="${getThClass('triple_doubles')}" onclick="playersComponent.sortAggBy('triple_doubles')">Tri-Dubs${ind('triple_doubles')}</th>
        <th class="${getThClass('high_pts')}" onclick="playersComponent.sortAggBy('high_pts')" style="color: var(--accent-gold);">Personal High${ind('high_pts')}</th>
      `;

      let list = [...app.data.players];
      if (minGames > 1) list = list.filter(p => p.games_count >= minGames);
      if (caliberFilter === 'MVP') list = list.filter(p => p.is_mvp);
      else if (caliberFilter === 'ALL_STAR') list = list.filter(p => p.is_all_star || p.is_all_nba || p.is_mvp);

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

      this.paginateAgg(list, tbody, (p) => `
        <tr onclick="app.openPlayerDossier('${p.name.replace(/'/g, "\\'")}', 'nba')" style="cursor: pointer;">
          <td class="text-left ${getTdClass('name')}">
            <span class="player-link">${p.name}</span>
            ${this.getCaliberBadge(p, 'nba')}
          </td>
          <td class="text-left">${p.teams.map(t => `<span style="font-weight: 700; margin-right: 4px; color: ${app.getTeamColor(t)};">${t}</span>`).join('')}</td>
          <td class="${getTdClass('games_count')}" style="font-weight: 700;">${p.games_count}</td>
          <td class="${getTdClass('win_pct')}" style="color: ${p.win_pct >= 0.6 ? 'var(--accent-emerald)' : 'var(--text-secondary)'};">${p.wins}-${p.losses}</td>
          <td class="${getTdClass('pts')}" style="font-weight: 800; color: var(--accent-cyan);">${p.pts}</td>
          <td class="${getTdClass('ppg')}" style="font-weight: 700;">${p.ppg}</td>
          <td class="${getTdClass('reb')}">${p.reb}</td>
          <td class="${getTdClass('rpg')}">${p.rpg}</td>
          <td class="${getTdClass('ast')}">${p.ast}</td>
          <td class="${getTdClass('apg')}">${p.apg}</td>
          <td class="${getTdClass('tpm')}">${p.tpm}</td>
          <td class="${getTdClass('fg_pct')}">${(p.fg_pct * 100).toFixed(0)}%</td>
          <td class="${getTdClass('triple_doubles')}">${p.triple_doubles > 0 ? `<strong style="color: var(--accent-gold);">${p.triple_doubles}</strong>` : '-'}</td>
          <td class="${getTdClass('high_pts')}" style="font-weight: 700; color: var(--accent-gold);">${p.highs.pts} PTS</td>
        </tr>
      `);
    } else if (sport === 'mlb') {
      tableThead.innerHTML = `
        <th class="text-left ${getThClass('name')}" onclick="playersComponent.sortAggBy('name')">Batter${ind('name')}</th>
        <th class="text-left">Teams</th>
        <th class="${getThClass('games_count')}" onclick="playersComponent.sortAggBy('games_count')">Games${ind('games_count')}</th>
        <th class="${getThClass('ab')}" onclick="playersComponent.sortAggBy('ab')">AB${ind('ab')}</th>
        <th class="${getThClass('h')}" onclick="playersComponent.sortAggBy('h')" style="color: var(--accent-cyan);">Hits${ind('h')}</th>
        <th class="${getThClass('hr')}" onclick="playersComponent.sortAggBy('hr')" style="color: var(--accent-gold);">Home Runs${ind('hr')}</th>
        <th class="${getThClass('rbi')}" onclick="playersComponent.sortAggBy('rbi')">RBI${ind('rbi')}</th>
        <th class="${getThClass('r')}" onclick="playersComponent.sortAggBy('r')">Runs${ind('r')}</th>
        <th class="${getThClass('avg')}" onclick="playersComponent.sortAggBy('avg')">Batting AVG${ind('avg')}</th>
        <th class="${getThClass('high_hr')}" onclick="playersComponent.sortAggBy('high_hr')">Personal High HR${ind('high_hr')}</th>
      `;

      let list = [...(app.data.batters || [])];
      if (minGames > 1) list = list.filter(b => b.games_count >= minGames);
      if (caliberFilter === 'MVP') list = list.filter(b => b.is_mvp);
      else if (caliberFilter === 'ALL_STAR') list = list.filter(b => b.is_all_star || b.is_all_nba || b.is_mvp);

      if (searchTerm) list = list.filter(b => b.name.toLowerCase().includes(searchTerm) || b.teams.some(t => t.toLowerCase().includes(searchTerm)));

      const col = this.aggState.sortCol;
      const asc = this.aggState.sortAsc;
      list.sort((a, b) => {
        let valA = a[col] ?? 0;
        let valB = b[col] ?? 0;
        if (typeof valA === 'string') return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        return asc ? (valA - valB) : (valB - valA);
      });

      this.paginateAgg(list, tbody, (b) => `
        <tr onclick="app.openPlayerDossier('${b.name.replace(/'/g, "\\'")}', 'mlb_bat')" style="cursor: pointer;">
          <td class="text-left ${getTdClass('name')}">
            <span class="player-link">${b.name}</span>
            ${this.getCaliberBadge(b, 'mlb_bat')}
          </td>
          <td class="text-left">${b.teams.map(t => `<span style="font-weight: 700; margin-right: 4px; color: ${app.getTeamColor(t)};">${t}</span>`).join('')}</td>
          <td class="${getTdClass('games_count')}" style="font-weight: 700;">${b.games_count}</td>
          <td class="${getTdClass('ab')}">${b.ab}</td>
          <td class="${getTdClass('h')}" style="font-weight: 700; color: var(--accent-cyan);">${b.h}</td>
          <td class="${getTdClass('hr')}" style="font-weight: 800; color: ${b.hr > 0 ? 'var(--accent-gold)' : 'inherit'}; font-size: 0.95rem;">${b.hr}</td>
          <td class="${getTdClass('rbi')}" style="font-weight: 700;">${b.rbi}</td>
          <td class="${getTdClass('r')}">${b.r}</td>
          <td class="${getTdClass('avg')}" style="font-weight: 700;">.${(b.avg * 1000).toFixed(0)}</td>
          <td class="${getTdClass('high_hr')}" style="font-weight: 700; color: var(--accent-gold);">${b.high_hr} HR</td>
        </tr>
      `);
    } else if (sport === 'soccer') {
      tableThead.innerHTML = `
        <th class="text-left ${getThClass('name')}" onclick="playersComponent.sortAggBy('name')">Player${ind('name')}</th>
        <th class="text-left">Teams</th>
        <th class="${getThClass('matches_count')}" onclick="playersComponent.sortAggBy('matches_count')">Matches${ind('matches_count')}</th>
        <th class="${getThClass('goals')}" onclick="playersComponent.sortAggBy('goals')" style="color: var(--accent-gold);">Goals${ind('goals')}</th>
        <th class="${getThClass('assists')}" onclick="playersComponent.sortAggBy('assists')" style="color: var(--accent-cyan);">Assists${ind('assists')}</th>
        <th class="${getThClass('mins')}" onclick="playersComponent.sortAggBy('mins')">Minutes Played${ind('mins')}</th>
        <th class="${getThClass('yc')}" onclick="playersComponent.sortAggBy('yc')">Yellow Cards${ind('yc')}</th>
        <th class="${getThClass('rc')}" onclick="playersComponent.sortAggBy('rc')">Red Cards${ind('rc')}</th>
      `;

      let list = [...(app.data.players || [])];
      if (minGames > 1) list = list.filter(p => p.matches_count >= minGames);
      if (caliberFilter === 'MVP') list = list.filter(p => p.is_mvp);
      else if (caliberFilter === 'ALL_STAR') list = list.filter(p => p.is_all_star || p.is_all_nba || p.is_mvp);

      if (searchTerm) list = list.filter(p => p.name.toLowerCase().includes(searchTerm) || p.teams.some(t => t.toLowerCase().includes(searchTerm)));

      const col = this.aggState.sortCol;
      const asc = this.aggState.sortAsc;
      list.sort((a, b) => {
        let valA = a[col] ?? 0;
        let valB = b[col] ?? 0;
        if (typeof valA === 'string') return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        return asc ? (valA - valB) : (valB - valA);
      });

      this.paginateAgg(list, tbody, (p) => `
        <tr onclick="app.openPlayerDossier('${p.name.replace(/'/g, "\\'")}', 'soccer')" style="cursor: pointer;">
          <td class="text-left ${getTdClass('name')}">
            <span class="player-link">${p.name}</span>
            ${this.getCaliberBadge(p, 'soccer')}
          </td>
          <td class="text-left">${p.teams.join(', ')}</td>
          <td class="${getTdClass('matches_count')}" style="font-weight: 700;">${p.matches_count}</td>
          <td class="${getTdClass('goals')}" style="font-weight: 800; color: ${p.goals > 0 ? 'var(--accent-gold)' : 'inherit'};">${p.goals}</td>
          <td class="${getTdClass('assists')}" style="font-weight: 700; color: ${p.assists > 0 ? 'var(--accent-cyan)' : 'inherit'};">${p.assists}</td>
          <td class="${getTdClass('mins')}">${p.mins}</td>
          <td class="${getTdClass('yc')}">${p.yc}</td>
          <td class="${getTdClass('rc')}">${p.rc}</td>
        </tr>
      `);
    }
  },

  sortDossierTable(col) {
    if (!this.dossierState.player) return;

    if (this.dossierState.sortCol === col) {
      this.dossierState.sortAsc = !this.dossierState.sortAsc;
    } else {
      this.dossierState.sortCol = col;
      this.dossierState.sortAsc = false;
    }

    const asc = this.dossierState.sortAsc;
    this.dossierState.log.sort((a, b) => {
      let valA = a[col] ?? 0;
      let valB = b[col] ?? 0;
      if (typeof valA === 'string') return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return asc ? (valA - valB) : (valB - valA);
    });

    this.renderDossierTableOnly();
  },

  renderDossierTableOnly() {
    const tableContainer = document.getElementById('dossier-table-container');
    if (!tableContainer) return;

    const { player, playerType, sortCol, sortAsc, log } = this.dossierState;
    const ind = (c) => (sortCol === c ? (sortAsc ? ' ▲' : ' ▼') : ' ↕');
    const thClass = (c) => (sortCol === c ? 'sorted-active' : '');
    const tdClass = (c) => (sortCol === c ? 'sorted-active-cell' : '');

    if (playerType === 'nba') {
      tableContainer.innerHTML = `
        <table class="stats-table">
          <thead>
            <tr>
              <th class="text-left ${thClass('date')}" onclick="playersComponent.sortDossierTable('date')">Date${ind('date')}</th>
              <th class="${thClass('team')}" onclick="playersComponent.sortDossierTable('team')">Team${ind('team')}</th>
              <th class="${thClass('opp')}" onclick="playersComponent.sortDossierTable('opp')">Opp${ind('opp')}</th>
              <th class="${thClass('wl')}" onclick="playersComponent.sortDossierTable('wl')">W/L${ind('wl')}</th>
              <th class="${thClass('mins')}" onclick="playersComponent.sortDossierTable('mins')">MIN${ind('mins')}</th>
              <th class="${thClass('pts')}" onclick="playersComponent.sortDossierTable('pts')" style="color: var(--accent-cyan);">PTS${ind('pts')}</th>
              <th class="${thClass('reb')}" onclick="playersComponent.sortDossierTable('reb')">REB${ind('reb')}</th>
              <th class="${thClass('ast')}" onclick="playersComponent.sortDossierTable('ast')">AST${ind('ast')}</th>
              <th class="${thClass('stl')}" onclick="playersComponent.sortDossierTable('stl')">STL${ind('stl')}</th>
              <th class="${thClass('blk')}" onclick="playersComponent.sortDossierTable('blk')">BLK${ind('blk')}</th>
              <th>FG</th>
              <th>3P</th>
              <th class="${thClass('game_score')}" onclick="playersComponent.sortDossierTable('game_score')" style="color: var(--accent-gold);">GameScore${ind('game_score')}</th>
            </tr>
          </thead>
          <tbody>
            ${log.map(g => `
              <tr>
                <td class="text-left ${tdClass('date')}">${g.date}</td>
                <td class="${tdClass('team')}"><span style="font-weight: 700; color: ${app.getTeamColor(g.team)};">${g.team}</span></td>
                <td class="${tdClass('opp')}">${g.opp}</td>
                <td class="${tdClass('wl')}" style="font-weight: 700; color: ${g.wl === 'W' ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${g.wl}</td>
                <td class="${tdClass('mins')}">${g.mins}</td>
                <td class="${tdClass('pts')}" style="font-weight: 800; color: var(--accent-cyan);">${g.pts}</td>
                <td class="${tdClass('reb')}">${g.reb}</td>
                <td class="${tdClass('ast')}">${g.ast}</td>
                <td class="${tdClass('stl')}">${g.stl}</td>
                <td class="${tdClass('blk')}">${g.blk}</td>
                <td>${g.fgm}-${g.fga}</td>
                <td>${g.tpm}-${g.tpa}</td>
                <td class="${tdClass('game_score')}" style="font-weight: 700; color: var(--accent-gold);">${g.game_score}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (playerType === 'mlb_bat') {
      tableContainer.innerHTML = `
        <table class="stats-table">
          <thead>
            <tr>
              <th class="text-left ${thClass('date')}" onclick="playersComponent.sortDossierTable('date')">Date${ind('date')}</th>
              <th class="${thClass('team')}" onclick="playersComponent.sortDossierTable('team')">Team${ind('team')}</th>
              <th class="${thClass('opp')}" onclick="playersComponent.sortDossierTable('opp')">Opp${ind('opp')}</th>
              <th class="${thClass('pos')}" onclick="playersComponent.sortDossierTable('pos')">Pos${ind('pos')}</th>
              <th class="${thClass('ab')}" onclick="playersComponent.sortDossierTable('ab')">AB${ind('ab')}</th>
              <th class="${thClass('r')}" onclick="playersComponent.sortDossierTable('r')">R${ind('r')}</th>
              <th class="${thClass('h')}" onclick="playersComponent.sortDossierTable('h')" style="color: var(--accent-cyan);">H${ind('h')}</th>
              <th class="${thClass('hr')}" onclick="playersComponent.sortDossierTable('hr')" style="color: var(--accent-gold);">HR${ind('hr')}</th>
              <th class="${thClass('rbi')}" onclick="playersComponent.sortDossierTable('rbi')">RBI${ind('rbi')}</th>
              <th class="${thClass('bb')}" onclick="playersComponent.sortDossierTable('bb')">BB${ind('bb')}</th>
              <th class="${thClass('so')}" onclick="playersComponent.sortDossierTable('so')">SO${ind('so')}</th>
            </tr>
          </thead>
          <tbody>
            ${log.map(g => `
              <tr>
                <td class="text-left ${tdClass('date')}">${g.date}</td>
                <td class="${tdClass('team')}"><span style="font-weight: 700; color: ${app.getTeamColor(g.team)};">${g.team}</span></td>
                <td class="${tdClass('opp')}">${g.opp}</td>
                <td class="${tdClass('pos')}">${g.pos}</td>
                <td class="${tdClass('ab')}">${g.ab}</td>
                <td class="${tdClass('r')}">${g.r}</td>
                <td class="${tdClass('h')}" style="font-weight: 700; color: ${g.h >= 2 ? 'var(--accent-cyan)' : 'inherit'};">${g.h}</td>
                <td class="${tdClass('hr')}" style="font-weight: 800; color: ${g.hr > 0 ? 'var(--accent-gold)' : 'inherit'};">${g.hr}</td>
                <td class="${tdClass('rbi')}" style="font-weight: 700;">${g.rbi}</td>
                <td class="${tdClass('bb')}">${g.bb}</td>
                <td class="${tdClass('so')}">${g.so}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (playerType === 'mlb_pitch') {
      tableContainer.innerHTML = `
        <table class="stats-table">
          <thead>
            <tr>
              <th class="text-left ${thClass('date')}" onclick="playersComponent.sortDossierTable('date')">Date${ind('date')}</th>
              <th class="${thClass('team')}" onclick="playersComponent.sortDossierTable('team')">Team${ind('team')}</th>
              <th class="${thClass('opp')}" onclick="playersComponent.sortDossierTable('opp')">Opp${ind('opp')}</th>
              <th class="${thClass('ip')}" onclick="playersComponent.sortDossierTable('ip')">IP${ind('ip')}</th>
              <th class="${thClass('h')}" onclick="playersComponent.sortDossierTable('h')">H${ind('h')}</th>
              <th class="${thClass('r')}" onclick="playersComponent.sortDossierTable('r')">R${ind('r')}</th>
              <th class="${thClass('er')}" onclick="playersComponent.sortDossierTable('er')">ER${ind('er')}</th>
              <th class="${thClass('bb')}" onclick="playersComponent.sortDossierTable('bb')">BB${ind('bb')}</th>
              <th class="${thClass('so')}" onclick="playersComponent.sortDossierTable('so')" style="color: var(--accent-gold);">SO${ind('so')}</th>
              <th class="${thClass('hr')}" onclick="playersComponent.sortDossierTable('hr')">HR${ind('hr')}</th>
              <th class="${thClass('pit')}" onclick="playersComponent.sortDossierTable('pit')">Pitches${ind('pit')}</th>
            </tr>
          </thead>
          <tbody>
            ${log.map(g => `
              <tr>
                <td class="text-left ${tdClass('date')}">${g.date}</td>
                <td class="${tdClass('team')}"><span style="font-weight: 700; color: ${app.getTeamColor(g.team)};">${g.team}</span></td>
                <td class="${tdClass('opp')}">${g.opp}</td>
                <td class="${tdClass('ip')}" style="font-weight: 700;">${g.ip}</td>
                <td class="${tdClass('h')}">${g.h}</td>
                <td class="${tdClass('r')}">${g.r}</td>
                <td class="${tdClass('er')}">${g.er}</td>
                <td class="${tdClass('bb')}">${g.bb}</td>
                <td class="${tdClass('so')}" style="font-weight: 800; color: ${g.so >= 7 ? 'var(--accent-gold)' : 'inherit'};">${g.so}</td>
                <td class="${tdClass('hr')}">${g.hr}</td>
                <td class="${tdClass('pit')}">${g.pit}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (playerType === 'soccer') {
      tableContainer.innerHTML = `
        <table class="stats-table">
          <thead>
            <tr>
              <th class="text-left ${thClass('date')}" onclick="playersComponent.sortDossierTable('date')">Date${ind('date')}</th>
              <th class="${thClass('team')}" onclick="playersComponent.sortDossierTable('team')">Team${ind('team')}</th>
              <th class="${thClass('opp')}" onclick="playersComponent.sortDossierTable('opp')">Opp${ind('opp')}</th>
              <th class="${thClass('pos')}" onclick="playersComponent.sortDossierTable('pos')">Pos${ind('pos')}</th>
              <th class="${thClass('mins')}" onclick="playersComponent.sortDossierTable('mins')">MIN${ind('mins')}</th>
              <th class="${thClass('goals')}" onclick="playersComponent.sortDossierTable('goals')" style="color: var(--accent-gold);">Goals${ind('goals')}</th>
              <th class="${thClass('assists')}" onclick="playersComponent.sortDossierTable('assists')" style="color: var(--accent-cyan);">Assists${ind('assists')}</th>
              <th class="${thClass('yc')}" onclick="playersComponent.sortDossierTable('yc')">YC${ind('yc')}</th>
              <th class="${thClass('rc')}" onclick="playersComponent.sortDossierTable('rc')">RC${ind('rc')}</th>
            </tr>
          </thead>
          <tbody>
            ${log.map(g => `
              <tr>
                <td class="text-left ${tdClass('date')}">${g.date}</td>
                <td class="${tdClass('team')}">${g.team}</td>
                <td class="${tdClass('opp')}">${g.opp}</td>
                <td class="${tdClass('pos')}">${g.pos}</td>
                <td class="${tdClass('mins')}">${g.mins}</td>
                <td class="${tdClass('goals')}" style="font-weight: 800; color: ${g.goals > 0 ? 'var(--accent-gold)' : 'inherit'};">${g.goals}</td>
                <td class="${tdClass('assists')}" style="font-weight: 700; color: ${g.assists > 0 ? 'var(--accent-cyan)' : 'inherit'};">${g.assists}</td>
                <td class="${tdClass('yc')}">${g.yc}</td>
                <td class="${tdClass('rc')}">${g.rc}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  },

  openDossier(playerName, playerType = 'nba') {
    if (playerType === 'nba') {
      const player = (app.rawBundle.nba.players || []).find(p => p.name === playerName);
      if (!player) return;

      this.dossierState = {
        player,
        playerType: 'nba',
        sortCol: 'date',
        sortAsc: false,
        log: [...player.log]
      };

      document.getElementById('modal-player-title').innerHTML = `
        ${player.name}
        ${this.getCaliberBadge(player, 'nba')}
      `;
      document.getElementById('modal-player-subtitle').textContent = 
        `🏀 NBA • Seen Live in Person: ${player.games_count} Games • Teams: ${player.teams.join(', ')} • Personal W-L: ${player.wins}-${player.losses}`;

      const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Total Points</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-cyan);">${player.pts}</div><div class="kpi-subtext">${player.ppg} PPG</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Total Rebounds</div><div class="kpi-value" style="font-size: 1.6rem;">${player.reb}</div><div class="kpi-subtext">${player.rpg} RPG</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Total Assists</div><div class="kpi-value" style="font-size: 1.6rem;">${player.ast}</div><div class="kpi-subtext">${player.apg} APG</div></div>
          <div class="kpi-card gold" style="padding: 0.85rem;"><div class="kpi-label">Personal High PTS</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-gold);">${player.highs.pts}</div><div class="kpi-subtext">Single Game</div></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h4 style="font-size: 1rem; font-weight: 800; margin: 0;">Complete In-Person Game Log (${player.log.length} Games)</h4>
          <span style="font-size: 0.75rem; color: var(--accent-cyan);">Click any column header to sort ↕</span>
        </div>
        <div class="table-responsive" id="dossier-table-container"></div>
      `;
      document.getElementById('modal-player-body').innerHTML = html;
      this.renderDossierTableOnly();
      document.getElementById('player-modal').classList.add('active');
    } else if (playerType === 'mlb_bat') {
      const player = (app.rawBundle.mlb.batters || []).find(b => b.name === playerName);
      if (!player) return;

      this.dossierState = {
        player,
        playerType: 'mlb_bat',
        sortCol: 'date',
        sortAsc: false,
        log: [...player.log]
      };

      document.getElementById('modal-player-title').innerHTML = `
        ${player.name}
        ${this.getCaliberBadge(player, 'mlb_bat')}
      `;
      document.getElementById('modal-player-subtitle').textContent = 
        `⚾ MLB Batter • Seen Live in Person: ${player.games_count} Games • Teams: ${player.teams.join(', ')}`;

      const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
          <div class="kpi-card gold" style="padding: 0.85rem;"><div class="kpi-label">Home Runs</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-gold);">${player.hr}</div><div class="kpi-subtext">Witnessed Live</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Hits</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-cyan);">${player.h}</div><div class="kpi-subtext">Across ${player.ab} At-Bats</div></div>
          <div class="kpi-card emerald" style="padding: 0.85rem;"><div class="kpi-label">Batting Average</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-emerald);">.${(player.avg * 1000).toFixed(0)}</div><div class="kpi-subtext">OBP: .${(player.obp * 1000).toFixed(0)}</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">RBIs & Runs</div><div class="kpi-value" style="font-size: 1.6rem;">${player.rbi} <span style="font-size: 1rem; color: var(--text-muted);">/ ${player.r} R</span></div><div class="kpi-subtext">Runs Produced</div></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h4 style="font-size: 1rem; font-weight: 800; margin: 0;">Complete In-Person Batting Log (${player.log.length} Games)</h4>
          <span style="font-size: 0.75rem; color: var(--accent-cyan);">Click any column header to sort ↕</span>
        </div>
        <div class="table-responsive" id="dossier-table-container"></div>
      `;
      document.getElementById('modal-player-body').innerHTML = html;
      this.renderDossierTableOnly();
      document.getElementById('player-modal').classList.add('active');
    } else if (playerType === 'mlb_pitch') {
      const player = (app.rawBundle.mlb.pitchers || []).find(p => p.name === playerName);
      if (!player) return;

      this.dossierState = {
        player,
        playerType: 'mlb_pitch',
        sortCol: 'date',
        sortAsc: false,
        log: [...player.log]
      };

      document.getElementById('modal-player-title').innerHTML = `
        ${player.name}
        ${this.getCaliberBadge(player, 'mlb_pitch')}
      `;
      document.getElementById('modal-player-subtitle').textContent = 
        `⚾ MLB Pitcher • Seen Live in Person: ${player.games_count} Outings • Teams: ${player.teams.join(', ')}`;

      const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
          <div class="kpi-card gold" style="padding: 0.85rem;"><div class="kpi-label">Strikeouts</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-gold);">${player.so}</div><div class="kpi-subtext">Total Ks in Person</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Innings Pitched</div><div class="kpi-value" style="font-size: 1.6rem;">${player.ip}</div><div class="kpi-subtext">Across ${player.games_count} Outings</div></div>
          <div class="kpi-card emerald" style="padding: 0.85rem;"><div class="kpi-label">ERA</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-emerald);">${player.era}</div><div class="kpi-subtext">WHIP: ${player.whip}</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Personal High SO</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-cyan);">${player.high_so} K</div><div class="kpi-subtext">Single Game</div></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h4 style="font-size: 1rem; font-weight: 800; margin: 0;">Complete In-Person Pitching Log (${player.log.length} Outings)</h4>
          <span style="font-size: 0.75rem; color: var(--accent-cyan);">Click any column header to sort ↕</span>
        </div>
        <div class="table-responsive" id="dossier-table-container"></div>
      `;
      document.getElementById('modal-player-body').innerHTML = html;
      this.renderDossierTableOnly();
      document.getElementById('player-modal').classList.add('active');
    } else if (playerType === 'soccer') {
      const player = (app.rawBundle.soccer.players || []).find(p => p.name === playerName);
      if (!player) return;

      this.dossierState = {
        player,
        playerType: 'soccer',
        sortCol: 'date',
        sortAsc: false,
        log: [...player.log]
      };

      document.getElementById('modal-player-title').innerHTML = `
        ${player.name}
        ${this.getCaliberBadge(player, 'soccer')}
      `;
      document.getElementById('modal-player-subtitle').textContent = 
        `⚽ Football Player • Seen in ${player.matches_count} Matches • Teams: ${player.teams.join(', ')}`;

      const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
          <div class="kpi-card gold" style="padding: 0.85rem;"><div class="kpi-label">Goals</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-gold);">${player.goals}</div><div class="kpi-subtext">Scored Live</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Assists</div><div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-cyan);">${player.assists}</div><div class="kpi-subtext">Assists Recorded</div></div>
          <div class="kpi-card" style="padding: 0.85rem;"><div class="kpi-label">Minutes Played</div><div class="kpi-value" style="font-size: 1.6rem;">${player.mins}</div><div class="kpi-subtext">Across ${player.matches_count} Matches</div></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h4 style="font-size: 1rem; font-weight: 800; margin: 0;">Match Appearances (${player.log.length} Matches)</h4>
          <span style="font-size: 0.75rem; color: var(--accent-cyan);">Click any column header to sort ↕</span>
        </div>
        <div class="table-responsive" id="dossier-table-container"></div>
      `;
      document.getElementById('modal-player-body').innerHTML = html;
      this.renderDossierTableOnly();
      document.getElementById('player-modal').classList.add('active');
    }
  }
};
