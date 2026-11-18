// players.js - Performance Leaderboard and Aggregate Player Tracker
const playersComponent = {
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

  // Single Performances
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
    if (!tbody || !app.data) return;

    const searchTerm = (document.getElementById('perf-search-input')?.value || '').toLowerCase().trim();
    let list = [...app.data.single_performances];

    // Presets
    if (this.perfState.preset === '40_PTS') list = list.filter(p => p.pts >= 40);
    else if (this.perfState.preset === 'TRIPLE_DOUBLE') list = list.filter(p => p.triple_double);
    else if (this.perfState.preset === 'DOUBLE_DOUBLE') list = list.filter(p => p.double_double);
    else if (this.perfState.preset === '5_3PM') list = list.filter(p => p.tpm >= 5);
    else if (this.perfState.preset === '15_REB') list = list.filter(p => p.reb >= 15);
    else if (this.perfState.preset === '10_AST') list = list.filter(p => p.ast >= 10);

    // Search
    if (searchTerm) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.team.toLowerCase().includes(searchTerm) ||
        p.opp.toLowerCase().includes(searchTerm)
      );
    }

    // Sort
    const col = this.perfState.sortCol;
    const asc = this.perfState.sortAsc;

    list.sort((a, b) => {
      let valA = a[col.toLowerCase()] ?? a[col];
      let valB = b[col.toLowerCase()] ?? b[col];

      if (col === 'GAME_SCORE') { valA = a.game_score; valB = b.game_score; }
      if (col === 'FG%') { valA = a.fg_pct; valB = b.fg_pct; }
      if (col === '3PM') { valA = a.tpm; valB = b.tpm; }
      if (col === '3PA') { valA = a.tpa; valB = b.tpa; }

      if (typeof valA === 'string') {
        return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return asc ? (valA - valB) : (valB - valA);
    });

    // Pagination
    const totalCount = list.length;
    const maxPage = Math.max(1, Math.ceil(totalCount / this.perfState.pageSize));
    if (this.perfState.page > maxPage) this.perfState.page = maxPage;
    if (this.perfState.page < 1) this.perfState.page = 1;

    const startIdx = (this.perfState.page - 1) * this.perfState.pageSize;
    const pageItems = list.slice(startIdx, startIdx + this.perfState.pageSize);

    document.getElementById('perf-count-label').textContent = 
      `Showing ${totalCount > 0 ? startIdx + 1 : 0}-${Math.min(startIdx + this.perfState.pageSize, totalCount)} of ${totalCount} performances`;
    document.getElementById('perf-page-indicator').textContent = `Page ${this.perfState.page} of ${maxPage}`;
    document.getElementById('perf-prev-btn').disabled = (this.perfState.page <= 1);
    document.getElementById('perf-next-btn').disabled = (this.perfState.page >= maxPage);

    tbody.innerHTML = pageItems.map(p => `
      <tr>
        <td class="text-left">
          <span class="player-link" onclick="app.openPlayerDossier('${p.name.replace(/'/g, "\\'")}')">
            ${p.name}
          </span>
          ${p.triple_double ? '<span style="font-size: 0.65rem; background: rgba(245,158,11,0.25); color: var(--accent-gold); padding: 1px 5px; border-radius: 4px; margin-left: 4px; font-weight: 800;">TRIPLE-DOUBLE</span>' : ''}
          ${p.double_double && !p.triple_double ? '<span style="font-size: 0.65rem; background: rgba(56,189,248,0.2); color: var(--accent-cyan); padding: 1px 4px; border-radius: 4px; margin-left: 4px;">DD</span>' : ''}
        </td>
        <td>${p.date}</td>
        <td>
          <span style="font-weight: 700; color: ${app.getTeamColor(p.team)};">${p.team}</span>
        </td>
        <td>${p.opp}</td>
        <td>${p.mins}</td>
        <td style="font-weight: 800; color: ${p.pts >= 40 ? 'var(--accent-gold)' : p.pts >= 30 ? 'var(--accent-cyan)' : 'var(--text-primary)'}; font-size: 0.9rem;">
          ${p.pts}
        </td>
        <td style="font-weight: ${p.reb >= 15 ? '800; color: var(--accent-cyan)' : p.reb >= 10 ? '700' : 'normal'};">${p.reb}</td>
        <td style="font-weight: ${p.ast >= 10 ? '800; color: var(--accent-gold)' : p.ast >= 7 ? '700' : 'normal'};">${p.ast}</td>
        <td>${p.stl}</td>
        <td>${p.blk}</td>
        <td style="font-weight: ${p.tpm >= 5 ? '700; color: var(--accent-purple)' : 'normal'};">${p.tpm}</td>
        <td>${p.tpa}</td>
        <td>${(p.fg_pct * 100).toFixed(1)}%</td>
        <td>${p.ftm}</td>
        <td>${p.to}</td>
        <td style="font-weight: 700; color: var(--accent-gold);">${p.game_score}</td>
      </tr>
    `).join('');
  },

  // Aggregate Players
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
    if (!tbody || !app.data) return;

    const searchTerm = (document.getElementById('player-agg-search')?.value || '').toLowerCase().trim();
    const minGames = parseInt(document.getElementById('player-min-games')?.value || '1', 10);

    let list = [...app.data.players];

    list = list.filter(p => p.games_count >= minGames);

    if (searchTerm) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.teams.some(t => t.toLowerCase().includes(searchTerm))
      );
    }

    const col = this.aggState.sortCol;
    const asc = this.aggState.sortAsc;

    list.sort((a, b) => {
      let valA = a[col];
      let valB = b[col];

      if (col === 'high_pts') { valA = a.highs.pts; valB = b.highs.pts; }

      if (typeof valA === 'string') {
        return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return asc ? (valA - valB) : (valB - valA);
    });

    tbody.innerHTML = list.map(p => `
      <tr onclick="app.openPlayerDossier('${p.name.replace(/'/g, "\\'")}')" style="cursor: pointer;">
        <td class="text-left">
          <span class="player-link">${p.name}</span>
        </td>
        <td class="text-left">
          ${p.teams.map(t => `<span style="font-weight: 700; margin-right: 4px; color: ${app.getTeamColor(t)};">${t}</span>`).join('')}
        </td>
        <td style="font-weight: 700;">${p.games_count}</td>
        <td style="color: ${p.win_pct >= 0.6 ? 'var(--accent-emerald)' : p.win_pct <= 0.4 ? 'var(--accent-rose)' : 'var(--text-secondary)'}; font-weight: 600;">
          ${p.wins}-${p.losses} (${(p.win_pct * 100).toFixed(0)}%)
        </td>
        <td style="font-weight: 800; color: var(--accent-cyan); font-size: 0.9rem;">${p.pts}</td>
        <td style="font-weight: 700;">${p.ppg}</td>
        <td>${p.reb}</td>
        <td>${p.rpg}</td>
        <td>${p.ast}</td>
        <td>${p.apg}</td>
        <td>${p.tpm}</td>
        <td>${(p.fg_pct * 100).toFixed(1)}%</td>
        <td>${p.triple_doubles > 0 ? `<span style="font-weight: 800; color: var(--accent-gold);">${p.triple_doubles}</span>` : '-'}</td>
        <td style="font-weight: 700; color: var(--accent-gold);">${p.highs.pts} PTS</td>
      </tr>
    `).join('');
  },

  // Open Detailed Player Dossier
  openDossier(playerName) {
    const player = app.data.players.find(p => p.name === playerName);
    if (!player) return;

    document.getElementById('modal-player-title').textContent = player.name;
    document.getElementById('modal-player-subtitle').textContent = 
      `Seen Live in Person: ${player.games_count} Games • Teams: ${player.teams.join(', ')} • Your Record Watching: ${player.wins}-${player.losses} (${(player.win_pct * 100).toFixed(1)}%)`;

    const html = `
      <!-- Top Highlights Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
        <div class="kpi-card" style="padding: 0.85rem;">
          <div class="kpi-label">Total Points</div>
          <div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-cyan);">${player.pts}</div>
          <div class="kpi-subtext">${player.ppg} PPG Average</div>
        </div>
        <div class="kpi-card" style="padding: 0.85rem;">
          <div class="kpi-label">Total Rebounds</div>
          <div class="kpi-value" style="font-size: 1.6rem;">${player.reb}</div>
          <div class="kpi-subtext">${player.rpg} RPG Average</div>
        </div>
        <div class="kpi-card" style="padding: 0.85rem;">
          <div class="kpi-label">Total Assists</div>
          <div class="kpi-value" style="font-size: 1.6rem;">${player.ast}</div>
          <div class="kpi-subtext">${player.apg} APG Average</div>
        </div>
        <div class="kpi-card gold" style="padding: 0.85rem;">
          <div class="kpi-label">Personal High PTS</div>
          <div class="kpi-value" style="font-size: 1.6rem; color: var(--accent-gold);">${player.highs.pts}</div>
          <div class="kpi-subtext">Single Game Record</div>
        </div>
        <div class="kpi-card emerald" style="padding: 0.85rem;">
          <div class="kpi-label">Shooting Splits</div>
          <div style="font-size: 1rem; font-weight: 800; margin-top: 0.5rem; color: var(--text-primary);">
            ${(player.fg_pct * 100).toFixed(0)}% / ${(player.tp_pct * 100).toFixed(0)}% / ${(player.ft_pct * 100).toFixed(0)}%
          </div>
          <div class="kpi-subtext">FG / 3P / FT Pct</div>
        </div>
      </div>

      <!-- Highs Summary Banner -->
      <div style="background: rgba(15,23,42,0.8); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.75rem; font-size: 0.85rem;">
        <div>🔥 <strong>Max Points:</strong> <span style="color: var(--accent-gold);">${player.highs.pts}</span></div>
        <div>🦾 <strong>Max Rebounds:</strong> <span style="color: var(--accent-cyan);">${player.highs.reb}</span></div>
        <div>🪄 <strong>Max Assists:</strong> <span style="color: var(--accent-emerald);">${player.highs.ast}</span></div>
        <div>🎯 <strong>Max 3PM:</strong> <span style="color: var(--accent-purple);">${player.highs['3pm'] || 0}</span></div>
        <div>🔒 <strong>Max Steals:</strong> <span>${player.highs.stl}</span></div>
        <div>🚫 <strong>Max Blocks:</strong> <span>${player.highs.blk}</span></div>
        <div>⭐ <strong>Max GameScore:</strong> <span style="color: var(--accent-gold);">${player.highs.game_score}</span></div>
      </div>

      <!-- Chronological Game-by-Game Log -->
      <h4 style="font-size: 1rem; font-weight: 800; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">
        Complete In-Person Game Log (${player.log.length} Games Attended)
      </h4>
      <div class="table-responsive">
        <table class="stats-table">
          <thead>
            <tr>
              <th class="text-left">Date</th>
              <th>Team</th>
              <th>Opp</th>
              <th>W/L</th>
              <th>MIN</th>
              <th style="color: var(--accent-cyan);">PTS</th>
              <th>REB</th>
              <th>AST</th>
              <th>STL</th>
              <th>BLK</th>
              <th>FG</th>
              <th>FG%</th>
              <th>3P</th>
              <th>FT</th>
              <th>TO</th>
              <th style="color: var(--accent-gold);">GameScore</th>
            </tr>
          </thead>
          <tbody>
            ${player.log.map(g => `
              <tr>
                <td class="text-left">${g.date}</td>
                <td><span style="font-weight: 700; color: ${app.getTeamColor(g.team)};">${g.team}</span></td>
                <td>${g.opp}</td>
                <td>
                  <span style="font-weight: 700; color: ${g.wl === 'W' ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
                    ${g.wl}
                  </span>
                </td>
                <td>${g.mins}</td>
                <td style="font-weight: 700; color: ${g.pts >= 30 ? 'var(--accent-gold)' : 'var(--text-primary)'};">${g.pts}</td>
                <td>${g.reb}</td>
                <td>${g.ast}</td>
                <td>${g.stl}</td>
                <td>${g.blk}</td>
                <td>${g.fgm}-${g.fga}</td>
                <td>${(g.fg_pct * 100).toFixed(0)}%</td>
                <td>${g.tpm}-${g.tpa}</td>
                <td>${g.ftm}-${g.fta}</td>
                <td>${g.to}</td>
                <td style="font-weight: 700; color: var(--accent-gold);">${g.game_score}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('modal-player-body').innerHTML = html;
    document.getElementById('player-modal').classList.add('active');
  }
};
