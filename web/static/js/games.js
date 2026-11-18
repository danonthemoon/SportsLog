// games.js - Game Log and Box Score Component
const gamesComponent = {
  render() {
    const container = document.getElementById('games-grid-container');
    if (!container || !app.data) return;

    const searchTerm = (document.getElementById('game-search-input')?.value || '').toLowerCase().trim();
    const eventFilter = document.getElementById('game-event-filter')?.value || 'ALL';
    const teamFilter = document.getElementById('game-team-filter')?.value || 'ALL';
    const arenaFilter = document.getElementById('game-arena-filter')?.value || 'ALL';
    const sortOrder = document.getElementById('game-sort-select')?.value || 'date-desc';

    let list = [...app.data.games];

    // Search filter
    if (searchTerm) {
      list = list.filter(g => 
        g.home.team.toLowerCase().includes(searchTerm) ||
        g.away.team.toLowerCase().includes(searchTerm) ||
        g.home.abbrev.toLowerCase().includes(searchTerm) ||
        g.away.abbrev.toLowerCase().includes(searchTerm) ||
        g.arena.toLowerCase().includes(searchTerm) ||
        g.city.toLowerCase().includes(searchTerm) ||
        g.date.includes(searchTerm) ||
        (g.top_performers.mvp && g.top_performers.mvp.name.toLowerCase().includes(searchTerm))
      );
    }

    // Event filter
    if (eventFilter !== 'ALL') {
      if (eventFilter === 'Finals') list = list.filter(g => g.note.includes('Finals'));
      else if (eventFilter === 'Playoffs') list = list.filter(g => g.note.includes('Playoffs') || g.note.includes('Finals') || g.note.includes('WCF'));
      else if (eventFilter === 'Cup') list = list.filter(g => g.note.includes('Cup'));
      else if (eventFilter === 'Regular') list = list.filter(g => g.note.includes('Regular'));
    }

    // Team filter
    if (teamFilter !== 'ALL') {
      list = list.filter(g => g.home.abbrev === teamFilter || g.away.abbrev === teamFilter);
    }

    // Arena filter
    if (arenaFilter !== 'ALL') {
      list = list.filter(g => g.arena === arenaFilter);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortOrder === 'date-desc') return b.date.localeCompare(a.date);
      if (sortOrder === 'date-asc') return a.date.localeCompare(b.date);
      if (sortOrder === 'margin-asc') return a.margin - b.margin;
      if (sortOrder === 'margin-desc') return b.margin - a.margin;
      if (sortOrder === 'pts-desc') return b.total_pts - a.total_pts;
      if (sortOrder === 'pts-asc') return a.total_pts - b.total_pts;
      return 0;
    });

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔍</div>
          <h3>No games match your current filter</h3>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Try adjusting your search terms or filters above.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(game => {
      const isHomeWinner = game.home.wl === 'W';
      const eventBadgeClass = game.note.includes('Finals') ? 'finals' : 
                              game.note.includes('Playoffs') || game.note.includes('WCF') ? 'playoffs' : 
                              game.note.includes('Cup') ? 'cup' : '';

      return `
        <div class="game-card" onclick="gamesComponent.openBoxscore('${game.game_id}')">
          <div>
            <div class="game-card-header">
              <span class="game-date">📅 ${app.formatDate(game.date)}</span>
              <span class="event-badge ${eventBadgeClass}">${game.note}</span>
            </div>

            <!-- Away Team -->
            <div class="matchup-row ${!isHomeWinner ? 'winner' : ''}">
              <div class="team-meta">
                <div class="team-badge-circle" style="background: ${app.getTeamColor(game.away.abbrev)};">
                  ${game.away.abbrev}
                </div>
                <div>
                  <div class="team-name-label">${game.away.team}</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">${game.away.matchup}</div>
                </div>
              </div>
              <div class="team-score">${game.away.pts}</div>
            </div>

            <!-- Home Team -->
            <div class="matchup-row ${isHomeWinner ? 'winner' : ''}">
              <div class="team-meta">
                <div class="team-badge-circle" style="background: ${app.getTeamColor(game.home.abbrev)};">
                  ${game.home.abbrev}
                </div>
                <div>
                  <div class="team-name-label">${game.home.team}</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">${game.home.matchup}</div>
                </div>
              </div>
              <div class="team-score">${game.home.pts}</div>
            </div>

            ${game.top_performers.mvp ? `
              <div class="top-performer-pill">
                <span>⭐ Top Performer: <strong>${game.top_performers.mvp.name}</strong></span>
                <span style="color: var(--accent-cyan); font-weight: 700;">${game.top_performers.mvp.pts} PTS</span>
              </div>
            ` : ''}
          </div>

          <div class="game-meta-footer">
            <span class="game-arena">📍 ${game.arena} (${game.city})</span>
            <span style="color: var(--accent-cyan); font-weight: 600;">Box Score →</span>
          </div>
        </div>
      `;
    }).join('');
  },

  openBoxscore(gameId) {
    const game = app.data.games.find(g => g.game_id === gameId);
    if (!game) return;

    document.getElementById('modal-game-title').textContent = `${game.away.team} vs. ${game.home.team}`;
    document.getElementById('modal-game-subtitle').textContent = `📅 ${app.formatDate(game.date)} • 📍 ${game.arena}, ${game.city} • 🎯 ${game.note}`;

    const isHomeWinner = game.home.wl === 'W';
    const totalPts = game.home.pts + game.away.pts;

    const renderRoster = (teamObj) => {
      const players = teamObj.players || [];
      return `
        <div style="margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="team-badge-circle" style="background: ${app.getTeamColor(teamObj.abbrev)}; width: 28px; height: 28px; font-size: 0.7rem;">
                ${teamObj.abbrev}
              </span>
              <h4 style="font-size: 1rem; font-weight: 700;">${teamObj.team}</h4>
            </div>
            <div style="font-size: 0.85rem; font-weight: 700;">
              Total: <span style="color: var(--accent-cyan);">${teamObj.pts} PTS</span>
            </div>
          </div>
          <div class="table-responsive">
            <table class="stats-table">
              <thead>
                <tr>
                  <th class="text-left">Player</th>
                  <th>MIN</th>
                  <th style="color: var(--accent-cyan);">PTS</th>
                  <th>REB</th>
                  <th>AST</th>
                  <th>STL</th>
                  <th>BLK</th>
                  <th>FG</th>
                  <th>FG%</th>
                  <th>3P</th>
                  <th>3P%</th>
                  <th>FT</th>
                  <th>FT%</th>
                  <th>TO</th>
                  <th>PF</th>
                  <th style="color: var(--accent-gold);">GameScore</th>
                </tr>
              </thead>
              <tbody>
                ${players.map(p => `
                  <tr>
                    <td class="text-left">
                      <span class="player-link" onclick="app.openPlayerDossier('${p.NAME.replace(/'/g, "\\'")}')">
                        ${p.NAME}
                      </span>
                      ${p.DOUBLE_DOUBLE ? '<span style="font-size: 0.65rem; background: rgba(56,189,248,0.2); color: var(--accent-cyan); padding: 1px 4px; border-radius: 4px; margin-left: 4px;">DD</span>' : ''}
                      ${p.TRIPLE_DOUBLE ? '<span style="font-size: 0.65rem; background: rgba(245,158,11,0.2); color: var(--accent-gold); padding: 1px 4px; border-radius: 4px; margin-left: 4px; font-weight: 800;">TD</span>' : ''}
                    </td>
                    <td>${p.MINS}</td>
                    <td style="font-weight: 700; color: ${p.PTS >= 30 ? 'var(--accent-gold)' : 'var(--text-primary)'};">${p.PTS}</td>
                    <td style="font-weight: ${p.REB >= 10 ? '700' : 'normal'};">${p.REB}</td>
                    <td style="font-weight: ${p.AST >= 10 ? '700' : 'normal'};">${p.AST}</td>
                    <td>${p.STL}</td>
                    <td>${p.BLK}</td>
                    <td>${p.FGM}-${p.FGA}</td>
                    <td>${(p['FG%'] * 100).toFixed(1)}%</td>
                    <td>${p['3PM']}-${p['3PA']}</td>
                    <td>${p['3PA'] > 0 ? (p['3PM']/p['3PA']*100).toFixed(1)+'%' : '-'}</td>
                    <td>${p.FTM}-${p.FTA}</td>
                    <td>${p.FTA > 0 ? (p.FTM/p.FTA*100).toFixed(1)+'%' : '-'}</td>
                    <td>${p.TO}</td>
                    <td>${p.PF}</td>
                    <td style="font-weight: 700; color: var(--accent-gold);">${p.GAME_SCORE}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    };

    const renderStatComp = (label, awayVal, homeVal, formatPct = false) => {
      const aNum = parseFloat(awayVal) || 0;
      const hNum = parseFloat(homeVal) || 0;
      const total = (aNum + hNum) || 1;
      const aPct = Math.round((aNum / total) * 100);
      const hPct = 100 - aPct;
      const aText = formatPct ? `${(aNum * 100).toFixed(1)}%` : aNum;
      const hText = formatPct ? `${(hNum * 100).toFixed(1)}%` : hNum;

      return `
        <div class="comp-stat-row">
          <div style="text-align: left; color: ${aNum > hNum ? 'var(--accent-cyan)' : 'var(--text-secondary)'}; font-weight: 700;">${aText}</div>
          <div style="text-align: center;">
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 3px;">${label}</div>
            <div class="comp-bar">
              <div class="comp-bar-left" style="width: ${aPct}%;"></div>
              <div class="comp-bar-right" style="width: ${hPct}%;"></div>
            </div>
          </div>
          <div style="text-align: right; color: ${hNum > aNum ? 'var(--accent-rose)' : 'var(--text-secondary)'}; font-weight: 700;">${hText}</div>
        </div>
      `;
    };

    const html = `
      <!-- Scoreboard Banner -->
      <div style="display: flex; align-items: center; justify-content: space-around; background: rgba(15,23,42,0.8); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
        <div style="text-align: center;">
          <div class="team-badge-circle" style="background: ${app.getTeamColor(game.away.abbrev)}; width: 56px; height: 56px; font-size: 1.2rem; margin: 0 auto 0.5rem;">
            ${game.away.abbrev}
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 800;">${game.away.team}</h3>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Away • ${game.away.wl === 'W' ? '🏆 Winner' : 'Final'}</div>
          <div style="font-size: 2.75rem; font-weight: 900; margin-top: 0.25rem; color: ${!isHomeWinner ? 'var(--accent-cyan)' : 'var(--text-primary)'};">
            ${game.away.pts}
          </div>
        </div>

        <div style="text-align: center;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.25rem;">Final Score</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-secondary);">VS</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Margin: ${game.margin} PTS</div>
        </div>

        <div style="text-align: center;">
          <div class="team-badge-circle" style="background: ${app.getTeamColor(game.home.abbrev)}; width: 56px; height: 56px; font-size: 1.2rem; margin: 0 auto 0.5rem;">
            ${game.home.abbrev}
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 800;">${game.home.team}</h3>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Home • ${game.home.wl === 'W' ? '🏆 Winner' : 'Final'}</div>
          <div style="font-size: 2.75rem; font-weight: 900; margin-top: 0.25rem; color: ${isHomeWinner ? 'var(--accent-rose)' : 'var(--text-primary)'};">
            ${game.home.pts}
          </div>
        </div>
      </div>

      <!-- Team Stats Comparison -->
      <h4 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 0.6rem; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em;">
        Team Head-to-Head Comparison
      </h4>
      <div class="comparison-bar-container">
        ${renderStatComp('Field Goal %', game.away.fg_pct, game.home.fg_pct, true)}
        ${renderStatComp('3-Point %', game.away.tp_pct, game.home.tp_pct, true)}
        ${renderStatComp('Free Throw %', game.away.ft_pct, game.home.ft_pct, true)}
        ${renderStatComp('Total Rebounds', game.away.reb, game.home.reb)}
        ${renderStatComp('Assists', game.away.ast, game.home.ast)}
        ${renderStatComp('Steals', game.away.stl, game.home.stl)}
        ${renderStatComp('Blocks', game.away.blk, game.home.blk)}
        ${renderStatComp('Turnovers (Lower is Better)', game.away.to, game.home.to)}
      </div>

      <!-- Away Roster -->
      ${renderRoster(game.away)}

      <!-- Home Roster -->
      ${renderRoster(game.home)}
    `;

    document.getElementById('modal-boxscore-body').innerHTML = html;
    document.getElementById('boxscore-modal').classList.add('active');
  }
};
