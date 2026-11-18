// records.js - Attendance Trends, Records, and Superlatives (NBA, MLB, Soccer)
const recordsComponent = {
  render() {
    const container = document.getElementById('records-view-container');
    if (!container || !app.data) return;

    const sport = app.currentSport;
    const years = app.data.attendance_by_year || [];
    const maxYearCount = Math.max(...years.map(y => y.count), 1);

    if (sport === 'nba') {
      const sortedByPts = [...app.data.games].sort((a, b) => b.total_pts - a.total_pts);
      const highestGame = sortedByPts[0] || {};
      const sortedByMargin = [...app.data.games].sort((a, b) => b.margin - a.margin);
      const biggestBlowout = sortedByMargin[0] || {};
      const closestGame = sortedByMargin[sortedByMargin.length - 1] || {};

      const perfs = app.data.single_performances || [];
      const getLeader = (key) => {
        if (!perfs.length) return { val: 0, holders: [], names: '-', top: {} };
        const maxVal = Math.max(...perfs.map(p => p[key] || 0));
        const holders = perfs.filter(p => p[key] === maxVal);
        const nameList = [...new Set(holders.map(h => `${h.name} (${h.team})`))].join(', ');
        return { val: maxVal, holders, names: nameList, top: holders[0] || {} };
      };

      const top3p = getLeader('tpm');
      const topPts = getLeader('pts');
      const topAst = getLeader('ast');
      const topReb = getLeader('reb');

      container.innerHTML = `
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 1rem;">🔥 Attended Records & Superlatives</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
            <div class="kpi-card gold" style="padding: 1.15rem;">
              <div class="kpi-label">🎯 Most 3-Pointers in a Game</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-gold);">${top3p.val} 3PM</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${top3p.names}</div>
              <div class="kpi-subtext">${top3p.top.date || ''} • 8-for-13 from downtown</div>
            </div>

            <div class="kpi-card purple" style="padding: 1.15rem;">
              <div class="kpi-label">⚡ Most Points Witnessed</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-purple);">${topPts.val} PTS</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${topPts.names}</div>
              <div class="kpi-subtext">${topPts.top.date || ''} • 50-16-10 buzzer-beater</div>
            </div>

            <div class="kpi-card emerald" style="padding: 1.15rem;">
              <div class="kpi-label">🪄 Most Single-Game Assists</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-emerald);">${topAst.val} AST</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${topAst.names}</div>
              <div class="kpi-subtext">${topAst.top.date || ''} • 23 PTS, 16 AST masterclass</div>
            </div>

            <div class="kpi-card rose" style="padding: 1.15rem;">
              <div class="kpi-label">🦾 Most Single-Game Rebounds</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-rose);">${topReb.val} REB</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${topReb.names}</div>
              <div class="kpi-subtext">${topReb.top.date || ''} • 36 PTS, 21 REB, 8 AST monster game</div>
            </div>

            <div class="kpi-card" style="padding: 1.15rem;">
              <div class="kpi-label">💥 Highest Scoring Game</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-cyan);">${highestGame.total_pts} PTS</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${highestGame.home?.team} ${highestGame.home?.pts} vs ${highestGame.away?.team} ${highestGame.away?.pts}</div>
              <div class="kpi-subtext">${highestGame.date} • 📍 ${highestGame.arena}</div>
            </div>

            <div class="kpi-card emerald" style="padding: 1.15rem;">
              <div class="kpi-label">⏱️ Closest Thriller</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-emerald);">${closestGame.margin} PT Margin</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${closestGame.home?.team} ${closestGame.home?.pts} vs ${closestGame.away?.team} ${closestGame.away?.pts}</div>
              <div class="kpi-subtext">${closestGame.date} • 📍 ${closestGame.arena}</div>
            </div>
          </div>
        </div>

        <!-- Attendance by Year (Fixed Height & Padding to Never Cut Off Top Numbers) -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0;">NBA Attendance by Year</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${years.length} Seasons Logged</span>
          </div>
          <div style="display: flex; align-items: flex-end; gap: 1rem; height: 230px; padding-top: 2.25rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-subtle); overflow-x: auto;">
            ${years.map(y => `
              <div style="display: flex; flex-direction: column; align-items: center; min-width: 46px; flex: 1;">
                <span style="font-size: 0.8rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 6px;">${y.count}</span>
                <div style="width: 100%; max-width: 36px; height: ${Math.round((y.count / maxYearCount) * 135)}px; background: linear-gradient(180deg, #38bdf8, #0284c7); border-radius: 6px 6px 0 0;"></div>
                <span style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 8px; font-weight: 600;">${y.year}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Team Attendance Luck -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.35rem;">Attendance Luck by NBA Team</h3>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">Your personal record and team win rate watching each team live in person.</p>
          <div class="table-responsive">
            <table class="stats-table">
              <thead>
                <tr>
                  <th class="text-left">Team</th>
                  <th>Games Seen</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Win Rate In Person</th>
                  <th class="text-left" style="min-width: 140px;">Luck Bar</th>
                </tr>
              </thead>
              <tbody>
                ${(app.data.team_records || []).map(tr => `
                  <tr>
                    <td class="text-left">
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${(tr.colors && tr.colors[0]) || 'var(--accent-cyan)'}; margin-right: 6px;"></span>
                      <strong>${tr.team}</strong>
                    </td>
                    <td style="font-weight: 700;">${tr.games}</td>
                    <td style="color: var(--accent-emerald); font-weight: 700;">${tr.wins}</td>
                    <td style="color: var(--accent-rose); font-weight: 700;">${tr.losses}</td>
                    <td style="font-weight: 800; color: ${tr.win_pct >= 0.5 ? 'var(--accent-emerald)' : 'var(--text-secondary)'};">${(tr.win_pct * 100).toFixed(0)}%</td>
                    <td class="text-left">
                      <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden;">
                        <div style="width: ${(tr.win_pct * 100).toFixed(0)}%; height: 100%; background: ${tr.win_pct >= 0.5 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f43f5e, #fb7185)'};"></div>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (sport === 'mlb') {
      const sortedByRuns = [...app.data.games].sort((a, b) => b.total_runs - a.total_runs);
      const highestGame = sortedByRuns[0] || {};
      const sortedByMargin = [...app.data.games].sort((a, b) => b.margin - a.margin);
      const biggestBlowout = sortedByMargin[0] || {};

      const batting = app.data.single_batting || [];
      const pitching = app.data.single_pitching || [];

      const maxHitsVal = batting.length ? Math.max(...batting.map(b => b.h || 0)) : 4;
      const hitHolders = [...new Set(batting.filter(b => b.h === maxHitsVal).map(b => b.name))];
      const hitsNames = hitHolders.slice(0, 3).join(', ') + (hitHolders.length > 3 ? ' & more' : '');

      const maxKsVal = pitching.length ? Math.max(...pitching.map(p => p.so || 0)) : 12;
      const kHolders = pitching.filter(p => p.so === maxKsVal);
      const topK = kHolders[0] || { name: 'Trevor Cahill', team: 'OAK', date: '2018-05-05', ip: '6.0' };

      const maxHrVal = batting.length ? Math.max(...batting.map(b => b.hr || 0)) : 2;
      const hrHolders = [...new Set(batting.filter(b => b.hr === maxHrVal).map(b => b.name))];
      const hrNames = hrHolders.slice(0, 3).join(', ') + (hrHolders.length > 3 ? ' & more' : '');

      const maxRbiVal = batting.length ? Math.max(...batting.map(b => b.rbi || 0)) : 5;
      const rbiHolders = batting.filter(b => b.rbi === maxRbiVal);
      const topRbi = rbiHolders[0] || { name: 'Pat Burrell', team: 'PHI', date: '2008-08-23' };

      container.innerHTML = `
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 1rem;">⚾ Attended MLB Records & Superlatives</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
            <div class="kpi-card gold" style="padding: 1.15rem;">
              <div class="kpi-label">🏏 Most Hits in a Single Game</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-gold);">${maxHitsVal} Hits</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${hitsNames}</div>
              <div class="kpi-subtext">4-hit spectacles witnessed in person</div>
            </div>

            <div class="kpi-card emerald" style="padding: 1.15rem;">
              <div class="kpi-label">⚡ Most Strikeouts by Pitcher</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-emerald);">${maxKsVal} Ks</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${topK.name} (${topK.team})</div>
              <div class="kpi-subtext">${topK.date} • ${maxKsVal} Ks across ${topK.ip} IP</div>
            </div>

            <div class="kpi-card purple" style="padding: 1.15rem;">
              <div class="kpi-label">💥 Most Home Runs in a Game</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-purple);">${maxHrVal} HR</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${hrNames}</div>
              <div class="kpi-subtext">Multi-home run fireworks</div>
            </div>

            <div class="kpi-card rose" style="padding: 1.15rem;">
              <div class="kpi-label">🚀 Most Single-Game RBIs</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-rose);">${maxRbiVal} RBIs</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${topRbi.name} (${topRbi.team})</div>
              <div class="kpi-subtext">${topRbi.date} • Dominant run production</div>
            </div>

            <div class="kpi-card" style="padding: 1.15rem;">
              <div class="kpi-label">🔥 Highest Scoring Baseball Game</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-cyan);">${highestGame.total_runs} Runs</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${highestGame.home?.team} ${highestGame.home?.runs} vs ${highestGame.away?.team} ${highestGame.away?.runs}</div>
              <div class="kpi-subtext">${highestGame.date} • 📍 ${highestGame.stadium}</div>
            </div>

            <div class="kpi-card emerald" style="padding: 1.15rem;">
              <div class="kpi-label">🔨 Biggest MLB Blowout</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-emerald);">${biggestBlowout.margin} Runs Margin</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${biggestBlowout.home?.team} ${biggestBlowout.home?.runs} vs ${biggestBlowout.away?.team} ${biggestBlowout.away?.runs}</div>
              <div class="kpi-subtext">${biggestBlowout.date} • 📍 ${biggestBlowout.stadium}</div>
            </div>
          </div>
        </div>

        <!-- Attendance by Year (Fixed Height & Padding to Never Cut Off Top Numbers) -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0;">MLB Attendance Timeline by Year (2008–2026)</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${years.length} Seasons Logged</span>
          </div>
          <div style="display: flex; align-items: flex-end; gap: 1rem; height: 230px; padding-top: 2.25rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-subtle); overflow-x: auto;">
            ${years.map(y => `
              <div style="display: flex; flex-direction: column; align-items: center; min-width: 46px; flex: 1;">
                <span style="font-size: 0.8rem; font-weight: 800; color: var(--accent-emerald); margin-bottom: 6px;">${y.count}</span>
                <div style="width: 100%; max-width: 36px; height: ${Math.round((y.count / maxYearCount) * 135)}px; background: linear-gradient(180deg, #10b981, #059669); border-radius: 6px 6px 0 0;"></div>
                <span style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 8px; font-weight: 600;">${y.year}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- MLB Attendance Luck by Team -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.35rem;">Attendance Luck by MLB Franchise</h3>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">Your personal record and franchise win rate watching each team live in person.</p>
          <div class="table-responsive">
            <table class="stats-table">
              <thead>
                <tr>
                  <th class="text-left">Franchise</th>
                  <th>Games Seen</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Win Rate In Person</th>
                  <th class="text-left" style="min-width: 140px;">Luck Bar</th>
                </tr>
              </thead>
              <tbody>
                ${(app.data.team_records || []).map(tr => `
                  <tr>
                    <td class="text-left">
                      <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${(tr.colors && tr.colors[0]) || 'var(--accent-emerald)'}; margin-right: 6px;"></span>
                      <strong>${tr.team}</strong>
                    </td>
                    <td style="font-weight: 700;">${tr.games}</td>
                    <td style="color: var(--accent-emerald); font-weight: 700;">${tr.wins}</td>
                    <td style="color: var(--accent-rose); font-weight: 700;">${tr.losses}</td>
                    <td style="font-weight: 800; color: ${tr.win_pct >= 0.5 ? 'var(--accent-emerald)' : 'var(--text-secondary)'};">${(tr.win_pct * 100).toFixed(0)}%</td>
                    <td class="text-left">
                      <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden;">
                        <div style="width: ${(tr.win_pct * 100).toFixed(0)}%; height: 100%; background: ${tr.win_pct >= 0.5 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f43f5e, #fb7185)'};"></div>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (sport === 'soccer') {
      container.innerHTML = `
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 1rem;">⚽ Attended Football Records & Superlatives</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
            <div class="kpi-card gold" style="padding: 1.15rem;">
              <div class="kpi-label">👥 Highest Attendance Match</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-gold);">93,702 Fans</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">Real Madrid vs. Juventus</div>
              <div class="kpi-subtext">2022-07-30 • Rose Bowl, Pasadena</div>
            </div>

            <div class="kpi-card purple" style="padding: 1.15rem;">
              <div class="kpi-label">⚽ Most Single-Match Goals</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-purple);">4 Goals</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">Alex Morgan (San Diego Wave vs Gotham)</div>
              <div class="kpi-subtext">2022-05-07 • 4-0 Wave Victory</div>
            </div>

            <div class="kpi-card rose" style="padding: 1.15rem;">
              <div class="kpi-label">🟨 Most Yellow Cards in a Match</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-rose);">8 Bookings</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">Juventus vs. AC Milan</div>
              <div class="kpi-subtext">2023-04-29 • Fiery Serie A clash</div>
            </div>

            <div class="kpi-card emerald" style="padding: 1.15rem;">
              <div class="kpi-label">🚀 Biggest Blowout</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-emerald);">9-0 (+9 Margin)</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">USWNT 9, Paraguay 0</div>
              <div class="kpi-subtext">2021-09-16 • FirstEnergy Stadium</div>
            </div>

            <div class="kpi-card" style="padding: 1.15rem;">
              <div class="kpi-label">🌍 Continents Visited</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-cyan);">3 Continents</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">Europe, Africa, North America</div>
              <div class="kpi-subtext">Athens, Prague, Rome, Turin, Cape Town, USA</div>
            </div>

            <div class="kpi-card gold" style="padding: 1.15rem;">
              <div class="kpi-label">🌊 Most Watched Club</div>
              <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-gold);">19 Matches</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">San Diego Wave FC</div>
              <div class="kpi-subtext">Charter supporter at Torero & Snapdragon</div>
            </div>
          </div>
        </div>

        <!-- Attendance by Year (Fixed Height & Padding to Never Cut Off Top Numbers) -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0;">Soccer Match Attendance by Year (2016–2024)</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${years.length} Years Logged</span>
          </div>
          <div style="display: flex; align-items: flex-end; gap: 1rem; height: 230px; padding-top: 2.25rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-subtle); overflow-x: auto;">
            ${years.map(y => `
              <div style="display: flex; flex-direction: column; align-items: center; min-width: 46px; flex: 1;">
                <span style="font-size: 0.8rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 6px;">${y.count}</span>
                <div style="width: 100%; max-width: 36px; height: ${Math.round((y.count / maxYearCount) * 135)}px; background: linear-gradient(180deg, #38bdf8, #0284c7); border-radius: 6px 6px 0 0;"></div>
                <span style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 8px; font-weight: 600;">${y.year}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }
};
