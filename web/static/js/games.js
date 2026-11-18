// games.js - Game Log and Box Score Component (NBA, MLB, Soccer)
const gamesComponent = {
  render() {
    const container = document.getElementById('games-grid-container');
    if (!container || !app.data) return;

    const searchTerm = (document.getElementById('game-search-input')?.value || '').toLowerCase().trim();
    const eventFilter = document.getElementById('game-event-filter')?.value || 'ALL';
    const teamFilter = document.getElementById('game-team-filter')?.value || 'ALL';
    const arenaFilter = document.getElementById('game-arena-filter')?.value || 'ALL';
    const sortOrder = document.getElementById('game-sort-select')?.value || 'date-desc';

    const sport = app.currentSport;

    if (sport === 'nba') {
      this.renderNbaGames(container, searchTerm, eventFilter, teamFilter, arenaFilter, sortOrder);
    } else if (sport === 'mlb') {
      this.renderMlbGames(container, searchTerm, teamFilter, arenaFilter, sortOrder);
    } else if (sport === 'soccer') {
      this.renderSoccerMatches(container, searchTerm, teamFilter, arenaFilter, sortOrder);
    }
  },

  renderNbaGames(container, searchTerm, eventFilter, teamFilter, arenaFilter, sortOrder) {
    let list = [...app.data.games];

    if (searchTerm) {
      list = list.filter(g => 
        g.home.team.toLowerCase().includes(searchTerm) ||
        g.away.team.toLowerCase().includes(searchTerm) ||
        g.home.abbrev.toLowerCase().includes(searchTerm) ||
        g.away.abbrev.toLowerCase().includes(searchTerm) ||
        g.arena.toLowerCase().includes(searchTerm) ||
        g.city.toLowerCase().includes(searchTerm) ||
        g.date.includes(searchTerm)
      );
    }

    if (eventFilter !== 'ALL') {
      if (eventFilter === 'Finals') list = list.filter(g => g.note.includes('Finals'));
      else if (eventFilter === 'Playoffs') list = list.filter(g => g.note.includes('Playoffs') || g.note.includes('Finals') || g.note.includes('WCF'));
      else if (eventFilter === 'Cup') list = list.filter(g => g.note.includes('Cup'));
      else if (eventFilter === 'Regular') list = list.filter(g => g.note.includes('Regular'));
    }

    if (teamFilter !== 'ALL') {
      list = list.filter(g => g.home.abbrev === teamFilter || g.away.abbrev === teamFilter);
    }

    if (arenaFilter !== 'ALL') {
      list = list.filter(g => g.arena === arenaFilter);
    }

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
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);"><h3>No NBA games found</h3></div>`;
      return;
    }

    container.innerHTML = list.map(game => {
      const isHomeWinner = game.home.wl === 'W';
      const eventBadgeClass = game.note.includes('Finals') ? 'finals' : 
                              game.note.includes('Playoffs') || game.note.includes('WCF') ? 'playoffs' : 
                              game.note.includes('Cup') ? 'cup' : '';

      return `
        <div class="game-card" onclick="gamesComponent.openNbaBoxscore('${game.game_id}')">
          <!-- Left Column: Date, Note, Matchup & Score, Arena & City -->
          <div class="game-card-left">
            <div class="game-card-header">
              <span class="game-date">📅 ${app.formatDate(game.date)}</span>
              <span class="event-badge ${eventBadgeClass}">${game.note}</span>
            </div>

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

            <div class="game-meta-footer" style="margin-top: 0.5rem; padding-top: 0.5rem;">
              <span class="game-arena">📍 ${game.arena} • ${game.city}</span>
            </div>
          </div>

          <!-- Right Column: Top Performers and Key Team Stats -->
          <div class="game-card-right">
            <div>
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em;">
                ⭐ Top Performers
              </div>
              ${game.top_performers.mvp ? `
                <div class="top-performer-pill" style="margin-top: 0; margin-bottom: 0.35rem;">
                  <span>MVP: <strong>${game.top_performers.mvp.name}</strong> (${game.top_performers.mvp.team})</span>
                  <span style="color: var(--accent-cyan); font-weight: 700;">${game.top_performers.mvp.pts} PTS • GS ${game.top_performers.mvp.game_score}</span>
                </div>
              ` : ''}
              ${game.top_performers.scorer && (!game.top_performers.mvp || game.top_performers.scorer.name !== game.top_performers.mvp.name) ? `
                <div class="top-performer-pill" style="margin-top: 0; margin-bottom: 0.35rem;">
                  <span>Top Scorer: <strong>${game.top_performers.scorer.name}</strong> (${game.top_performers.scorer.team})</span>
                  <span style="color: var(--accent-gold); font-weight: 700;">${game.top_performers.scorer.val} PTS</span>
                </div>
              ` : ''}
              ${game.top_performers.playmaker ? `
                <div class="top-performer-pill" style="margin-top: 0; margin-bottom: 0.35rem;">
                  <span>Assists: <strong>${game.top_performers.playmaker.name}</strong></span>
                  <span style="color: var(--accent-emerald); font-weight: 700;">${game.top_performers.playmaker.val} AST</span>
                </div>
              ` : ''}

              <div style="margin-top: 0.75rem; padding-top: 0.6rem; border-top: 1px solid var(--border-subtle); font-size: 0.76rem; color: var(--text-secondary); display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <div>
                  <span style="color: var(--text-muted); font-size: 0.7rem; display: block;">SHOOTING SPLITS</span>
                  <span>${game.away.abbrev}: ${(game.away.fg_pct * 100).toFixed(0)}% FG (${game.away.tpm} 3PM)</span><br>
                  <span>${game.home.abbrev}: ${(game.home.fg_pct * 100).toFixed(0)}% FG (${game.home.tpm} 3PM)</span>
                </div>
                <div>
                  <span style="color: var(--text-muted); font-size: 0.7rem; display: block;">REB & AST</span>
                  <span>REB: ${game.away.reb} - ${game.home.reb}</span><br>
                  <span>AST: ${game.away.ast} - ${game.home.ast}</span>
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 0.75rem;">
              <span style="color: var(--accent-cyan); font-weight: 700; font-size: 0.8rem;">View Full Box Score →</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderMlbGames(container, searchTerm, teamFilter, arenaFilter, sortOrder) {
    let list = [...app.data.games];

    if (searchTerm) {
      list = list.filter(g => 
        g.home.team.toLowerCase().includes(searchTerm) ||
        g.away.team.toLowerCase().includes(searchTerm) ||
        g.home.abbrev.toLowerCase().includes(searchTerm) ||
        g.away.abbrev.toLowerCase().includes(searchTerm) ||
        g.stadium.toLowerCase().includes(searchTerm) ||
        g.date.includes(searchTerm)
      );
    }

    if (teamFilter !== 'ALL') {
      list = list.filter(g => g.home.abbrev === teamFilter || g.away.abbrev === teamFilter);
    }

    if (arenaFilter !== 'ALL') {
      list = list.filter(g => g.stadium === arenaFilter);
    }

    list.sort((a, b) => {
      if (sortOrder === 'date-desc') return b.date.localeCompare(a.date);
      if (sortOrder === 'date-asc') return a.date.localeCompare(b.date);
      if (sortOrder === 'margin-asc') return a.margin - b.margin;
      if (sortOrder === 'margin-desc') return b.margin - a.margin;
      if (sortOrder === 'pts-desc') return b.total_runs - a.total_runs;
      if (sortOrder === 'pts-asc') return a.total_runs - b.total_runs;
      return 0;
    });

    if (list.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);"><h3>No MLB games found</h3></div>`;
      return;
    }

    container.innerHTML = list.map(game => {
      const isHomeWinner = game.home.wl === 'W';
      return `
        <div class="game-card" onclick="gamesComponent.openMlbBoxscore('${game.game_id}')">
          <!-- Left Column: Date, Note, Matchup & Score, Ballpark -->
          <div class="game-card-left">
            <div class="game-card-header">
              <span class="game-date">📅 ${app.formatDate(game.date)}</span>
              <span class="event-badge" style="background: rgba(16,185,129,0.15); color: var(--accent-emerald);">MLB</span>
            </div>

            <div class="matchup-row ${!isHomeWinner ? 'winner' : ''}">
              <div class="team-meta">
                <div class="team-badge-circle" style="background: ${app.getTeamColor(game.away.abbrev)};">
                  ${game.away.abbrev}
                </div>
                <div>
                  <div class="team-name-label">${game.away.team}</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">${game.away.hits} Hits • ${game.away.hr} HR</div>
                </div>
              </div>
              <div class="team-score">${game.away.runs}</div>
            </div>

            <div class="matchup-row ${isHomeWinner ? 'winner' : ''}">
              <div class="team-meta">
                <div class="team-badge-circle" style="background: ${app.getTeamColor(game.home.abbrev)};">
                  ${game.home.abbrev}
                </div>
                <div>
                  <div class="team-name-label">${game.home.team}</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">${game.home.hits} Hits • ${game.home.hr} HR</div>
                </div>
              </div>
              <div class="team-score">${game.home.runs}</div>
            </div>

            <div class="game-meta-footer" style="margin-top: 0.5rem; padding-top: 0.5rem;">
              <span class="game-arena">📍 ${game.stadium}</span>
            </div>
          </div>

          <!-- Right Column: Top Performers and Key Team Stats -->
          <div class="game-card-right">
            <div>
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em;">
                ⭐ Top Performers & Match Facts
              </div>
              ${game.top_performer ? `
                <div class="top-performer-pill" style="margin-top: 0; margin-bottom: 0.35rem;">
                  <span>Hitter: <strong>${game.top_performer.name}</strong> (${game.top_performer.team})</span>
                  <span style="color: var(--accent-gold); font-weight: 700;">${game.top_performer.line}</span>
                </div>
              ` : ''}

              <div style="margin-top: 0.75rem; padding-top: 0.6rem; border-top: 1px solid var(--border-subtle); font-size: 0.76rem; color: var(--text-secondary); display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <div>
                  <span style="color: var(--text-muted); font-size: 0.7rem; display: block;">OFFENSIVE HITS & HR</span>
                  <span>${game.away.abbrev}: ${game.away.hits} Hits (${game.away.hr} HR)</span><br>
                  <span>${game.home.abbrev}: ${game.home.hits} Hits (${game.home.hr} HR)</span>
                </div>
                <div>
                  <span style="color: var(--text-muted); font-size: 0.7rem; display: block;">GAME METRICS</span>
                  <span>Total Runs: ${game.total_runs} (Diff: ${game.margin})</span><br>
                  <span>Attendance: ${game.attendance || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 0.75rem;">
              <span style="color: var(--accent-emerald); font-weight: 700; font-size: 0.8rem;">View Full Box Score →</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderSoccerMatches(container, searchTerm, teamFilter, arenaFilter, sortOrder) {
    let list = [...app.data.matches];

    if (searchTerm) {
      list = list.filter(m => 
        m.home.toLowerCase().includes(searchTerm) ||
        m.away.toLowerCase().includes(searchTerm) ||
        m.stadium.toLowerCase().includes(searchTerm) ||
        m.city.toLowerCase().includes(searchTerm) ||
        m.date.includes(searchTerm)
      );
    }

    if (teamFilter !== 'ALL') {
      list = list.filter(m => m.home === teamFilter || m.away === teamFilter);
    }

    if (arenaFilter !== 'ALL') {
      list = list.filter(m => m.stadium === arenaFilter);
    }

    list.sort((a, b) => {
      if (sortOrder === 'date-asc') return a.date.localeCompare(b.date);
      return b.date.localeCompare(a.date);
    });

    if (list.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);"><h3>No Soccer matches found</h3></div>`;
      return;
    }

    container.innerHTML = list.map(m => {
      const homeWin = Number(m.home_score) > Number(m.away_score);
      const awayWin = Number(m.away_score) > Number(m.home_score);

      return `
        <div class="game-card">
          <!-- Left Column: Date, Matchup & Score, Stadium & City -->
          <div class="game-card-left">
            <div class="game-card-header">
              <span class="game-date">📅 ${app.formatDate(m.date)}</span>
              <span class="event-badge" style="background: rgba(56,189,248,0.15); color: var(--accent-cyan);">Soccer</span>
            </div>

            <div class="matchup-row ${awayWin ? 'winner' : ''}">
              <div class="team-meta">
                <div class="team-badge-circle" style="background: #0284c7;">${m.away.slice(0,3).toUpperCase()}</div>
                <div><div class="team-name-label">${m.away}</div></div>
              </div>
              <div class="team-score">${m.away_score}</div>
            </div>

            <div class="matchup-row ${homeWin ? 'winner' : ''}">
              <div class="team-meta">
                <div class="team-badge-circle" style="background: #10b981;">${m.home.slice(0,3).toUpperCase()}</div>
                <div><div class="team-name-label">${m.home}</div></div>
              </div>
              <div class="team-score">${m.home_score}</div>
            </div>

            <div class="game-meta-footer" style="margin-top: 0.5rem; padding-top: 0.5rem;">
              <span class="game-arena">📍 ${m.stadium} • ${m.city}</span>
            </div>
          </div>

          <!-- Right Column: Top Performers & Key Match Stats -->
          <div class="game-card-right">
            <div>
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em;">
                ⭐ Key Match Facts & Performers
              </div>

              ${m.top_performer ? `
                <div class="top-performer-pill" style="margin-top: 0; margin-bottom: 0.35rem;">
                  <span>Performer: <strong>${m.top_performer.name}</strong> (${m.top_performer.team})</span>
                  <span style="color: var(--accent-gold); font-weight: 700;">${m.top_performer.line}</span>
                </div>
              ` : `
                <div class="top-performer-pill" style="margin-top: 0; margin-bottom: 0.35rem;">
                  <span>Result: <strong>${homeWin ? m.home + ' Victory' : awayWin ? m.away + ' Victory' : 'Draw'}</strong></span>
                  <span style="color: var(--accent-cyan); font-weight: 700;">${m.home_score}-${m.away_score} FT</span>
                </div>
              `}

              <div style="margin-top: 0.75rem; padding-top: 0.6rem; border-top: 1px solid var(--border-subtle); font-size: 0.76rem; color: var(--text-secondary); display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <div>
                  <span style="color: var(--text-muted); font-size: 0.7rem; display: block;">ATTENDANCE</span>
                  <span>${m.attendance ? Number(m.attendance).toLocaleString() + ' Fans' : 'Official Match'}</span>
                </div>
                <div>
                  <span style="color: var(--text-muted); font-size: 0.7rem; display: block;">STADIUM & LOCATION</span>
                  <span>${m.city}</span>
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 0.75rem;">
              <span style="color: var(--accent-cyan); font-weight: 700; font-size: 0.8rem;">Match Logged ✓</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  openNbaBoxscore(gameId) {
    const game = app.data.games.find(g => g.game_id === gameId);
    if (!game) return;

    document.getElementById('modal-game-title').textContent = `${game.away.team} vs. ${game.home.team}`;
    document.getElementById('modal-game-subtitle').textContent = `📅 ${app.formatDate(game.date)} • 📍 ${game.arena}, ${game.city} • 🎯 ${game.note}`;

    const isHomeWinner = game.home.wl === 'W';

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
                      <span class="player-link" onclick="app.openPlayerDossier('${p.NAME.replace(/'/g, "\\'")}', 'nba')">
                        ${p.NAME}
                      </span>
                      ${p.DOUBLE_DOUBLE ? '<span style="font-size: 0.65rem; background: rgba(56,189,248,0.2); color: var(--accent-cyan); padding: 1px 4px; border-radius: 4px; margin-left: 4px;">DD</span>' : ''}
                      ${p.TRIPLE_DOUBLE ? '<span style="font-size: 0.65rem; background: rgba(245,158,11,0.2); color: var(--accent-gold); padding: 1px 4px; border-radius: 4px; margin-left: 4px; font-weight: 800;">TD</span>' : ''}
                    </td>
                    <td>${p.MINS}</td>
                    <td style="font-weight: 700; color: ${p.PTS >= 30 ? 'var(--accent-gold)' : 'var(--text-primary)'};">${p.PTS}</td>
                    <td>${p.REB}</td>
                    <td>${p.AST}</td>
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

      ${renderRoster(game.away)}
      ${renderRoster(game.home)}
    `;

    document.getElementById('modal-boxscore-body').innerHTML = html;
    document.getElementById('boxscore-modal').classList.add('active');
  },

  openMlbBoxscore(gameId) {
    const game = app.data.games.find(g => g.game_id === gameId);
    if (!game) return;

    document.getElementById('modal-game-title').textContent = `${game.away.team} vs. ${game.home.team}`;
    document.getElementById('modal-game-subtitle').textContent = `📅 ${app.formatDate(game.date)} • 📍 ${game.stadium} • ⏱️ Duration: ${game.duration} • 👥 Attendance: ${game.attendance}`;

    const renderBatting = (teamObj) => `
      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--accent-cyan);">
          ${teamObj.team} — Batting Lineup (${teamObj.runs} Runs, ${teamObj.hits} Hits, ${teamObj.hr} HR)
        </h4>
        <div class="table-responsive">
          <table class="stats-table">
            <thead>
              <tr>
                <th class="text-left">Batter</th>
                <th>Pos</th>
                <th>AB</th>
                <th>R</th>
                <th style="color: var(--accent-cyan);">H</th>
                <th style="color: var(--accent-gold);">HR</th>
                <th>RBI</th>
                <th>BB</th>
                <th>SO</th>
                <th class="text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              ${(teamObj.batting || []).map(b => `
                <tr>
                  <td class="text-left">
                    <span class="player-link" onclick="app.openPlayerDossier('${b.Batting.replace(/'/g, "\\'")}', 'mlb_bat')">
                      ${b.Batting}
                    </span>
                  </td>
                  <td>${b.Pos || '-'}</td>
                  <td>${b.AB || 0}</td>
                  <td>${b.R || 0}</td>
                  <td style="font-weight: 700; color: ${b.H >= 3 ? 'var(--accent-cyan)' : 'inherit'};">${b.H || 0}</td>
                  <td style="font-weight: 800; color: ${b.HR > 0 ? 'var(--accent-gold)' : 'inherit'};">${b.HR || 0}</td>
                  <td style="font-weight: 700;">${b.RBI || 0}</td>
                  <td>${b.BB || 0}</td>
                  <td>${b.SO || 0}</td>
                  <td class="text-left" style="font-size: 0.72rem; color: var(--text-muted);">${b.Details || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const renderPitching = (teamObj) => `
      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--accent-emerald);">
          ${teamObj.team} — Pitching Outings
        </h4>
        <div class="table-responsive">
          <table class="stats-table">
            <thead>
              <tr>
                <th class="text-left">Pitcher</th>
                <th>IP</th>
                <th>H</th>
                <th>R</th>
                <th>ER</th>
                <th>BB</th>
                <th style="color: var(--accent-gold);">SO</th>
                <th>HR</th>
                <th>Pitches</th>
                <th>GameScore</th>
              </tr>
            </thead>
            <tbody>
              ${(teamObj.pitching || []).map(p => `
                <tr>
                  <td class="text-left">
                    <span class="player-link" onclick="app.openPlayerDossier('${p.Pitching.replace(/'/g, "\\'")}', 'mlb_pitch')">
                      ${p.Pitching}
                    </span>
                  </td>
                  <td style="font-weight: 700;">${p.IP}</td>
                  <td>${p.H}</td>
                  <td>${p.R}</td>
                  <td>${p.ER}</td>
                  <td>${p.BB}</td>
                  <td style="font-weight: 800; color: ${p.SO >= 7 ? 'var(--accent-gold)' : 'inherit'};">${p.SO}</td>
                  <td>${p.HR}</td>
                  <td>${p.Pit || '-'}</td>
                  <td style="font-weight: 700;">${p.GSc || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const html = `
      <div style="display: flex; align-items: center; justify-content: space-around; background: rgba(15,23,42,0.8); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
        <div style="text-align: center;">
          <div class="team-badge-circle" style="background: ${app.getTeamColor(game.away.abbrev)}; width: 56px; height: 56px; font-size: 1.2rem; margin: 0 auto 0.5rem;">
            ${game.away.abbrev}
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 800;">${game.away.team}</h3>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${game.away.wl === 'W' ? '🏆 Winner' : 'Final'}</div>
          <div style="font-size: 2.75rem; font-weight: 900; margin-top: 0.25rem;">${game.away.runs}</div>
        </div>

        <div style="text-align: center;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Final</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-secondary);">VS</div>
        </div>

        <div style="text-align: center;">
          <div class="team-badge-circle" style="background: ${app.getTeamColor(game.home.abbrev)}; width: 56px; height: 56px; font-size: 1.2rem; margin: 0 auto 0.5rem;">
            ${game.home.abbrev}
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 800;">${game.home.team}</h3>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${game.home.wl === 'W' ? '🏆 Winner' : 'Final'}</div>
          <div style="font-size: 2.75rem; font-weight: 900; margin-top: 0.25rem;">${game.home.runs}</div>
        </div>
      </div>

      <!-- Batting Sections -->
      ${renderBatting(game.away)}
      ${renderBatting(game.home)}

      <!-- Pitching Sections -->
      ${renderPitching(game.away)}
      ${renderPitching(game.home)}
    `;

    document.getElementById('modal-boxscore-body').innerHTML = html;
    document.getElementById('boxscore-modal').classList.add('active');
  }
};
