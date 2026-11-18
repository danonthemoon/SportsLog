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
      const lowestGame = sortedByPts[sortedByPts.length - 1] || {};
      const sortedByMargin = [...app.data.games].sort((a, b) => b.margin - a.margin);
      const biggestBlowout = sortedByMargin[0] || {};
      const closestGame = sortedByMargin[sortedByMargin.length - 1] || {};

      container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          <div class="kpi-card gold" style="padding: 1.25rem;">
            <div class="kpi-label">🔥 Highest Scoring Game</div>
            <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-gold);">${highestGame.total_pts} PTS</div>
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${highestGame.home?.team} ${highestGame.home?.pts} vs ${highestGame.away?.team} ${highestGame.away?.pts}</div>
            <div class="kpi-subtext">📅 ${highestGame.date} • 📍 ${highestGame.arena}</div>
          </div>
          <div class="kpi-card emerald" style="padding: 1.25rem;">
            <div class="kpi-label">⚡ Closest Finish</div>
            <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-emerald);">${closestGame.margin} PT Diff</div>
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${closestGame.home?.team} ${closestGame.home?.pts} vs ${closestGame.away?.team} ${closestGame.away?.pts}</div>
            <div class="kpi-subtext">📅 ${closestGame.date} • 📍 ${closestGame.arena}</div>
          </div>
          <div class="kpi-card purple" style="padding: 1.25rem;">
            <div class="kpi-label">🔨 Biggest Blowout</div>
            <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-purple);">${biggestBlowout.margin} PTS Margin</div>
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${biggestBlowout.home?.team} ${biggestBlowout.home?.pts} vs ${biggestBlowout.away?.team} ${biggestBlowout.away?.pts}</div>
            <div class="kpi-subtext">📅 ${biggestBlowout.date} • 📍 ${biggestBlowout.arena}</div>
          </div>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
          <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.25rem;">NBA Attendance by Year</h3>
          <div style="display: flex; align-items: flex-end; gap: 1rem; height: 220px; padding-top: 1rem; border-bottom: 1px solid var(--border-subtle); overflow-x: auto;">
            ${years.map(y => `
              <div style="display: flex; flex-direction: column; align-items: center; min-width: 45px; flex: 1;">
                <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 4px;">${y.count}</span>
                <div style="width: 100%; max-width: 38px; height: ${Math.round((y.count / maxYearCount) * 180)}px; background: linear-gradient(180deg, #38bdf8, #0284c7); border-radius: 6px 6px 0 0;"></div>
                <span style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 8px;">${y.year}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 1rem;">Attendance Luck by Team</h3>
          <div class="table-responsive">
            <table class="stats-table">
              <thead><tr><th class="text-left">Team</th><th>Games</th><th>Wins</th><th>Losses</th><th>Win Rate In Person</th></tr></thead>
              <tbody>
                ${(app.data.team_records || []).map(tr => `
                  <tr>
                    <td class="text-left"><strong>${tr.team}</strong></td>
                    <td>${tr.games}</td><td style="color: var(--accent-emerald); font-weight: 700;">${tr.wins}</td>
                    <td style="color: var(--accent-rose); font-weight: 700;">${tr.losses}</td>
                    <td style="font-weight: 700;">${(tr.win_pct * 100).toFixed(0)}%</td>
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

      container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          <div class="kpi-card gold" style="padding: 1.25rem;">
            <div class="kpi-label">🔥 Highest Scoring Baseball Game</div>
            <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-gold);">${highestGame.total_runs} Runs</div>
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${highestGame.home?.team} ${highestGame.home?.runs} vs ${highestGame.away?.team} ${highestGame.away?.runs}</div>
            <div class="kpi-subtext">📅 ${highestGame.date} • 📍 ${highestGame.stadium}</div>
          </div>
          <div class="kpi-card purple" style="padding: 1.25rem;">
            <div class="kpi-label">🔨 Biggest MLB Blowout</div>
            <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-purple);">${biggestBlowout.margin} Runs Margin</div>
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">${biggestBlowout.home?.team} ${biggestBlowout.home?.runs} vs ${biggestBlowout.away?.team} ${biggestBlowout.away?.runs}</div>
            <div class="kpi-subtext">📅 ${biggestBlowout.date} • 📍 ${biggestBlowout.stadium}</div>
          </div>
        </div>

        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.25rem;">MLB Attendance Timeline by Year (2008–2024)</h3>
          <div style="display: flex; align-items: flex-end; gap: 1rem; height: 220px; padding-top: 1rem; border-bottom: 1px solid var(--border-subtle); overflow-x: auto;">
            ${years.map(y => `
              <div style="display: flex; flex-direction: column; align-items: center; min-width: 45px; flex: 1;">
                <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent-emerald); margin-bottom: 4px;">${y.count}</span>
                <div style="width: 100%; max-width: 38px; height: ${Math.round((y.count / maxYearCount) * 180)}px; background: linear-gradient(180deg, #10b981, #059669); border-radius: 6px 6px 0 0;"></div>
                <span style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 8px;">${y.year}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (sport === 'soccer') {
      container.innerHTML = `
        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.25rem;">Soccer Match Attendance by Year (2016–2024)</h3>
          <div style="display: flex; align-items: flex-end; gap: 1rem; height: 220px; padding-top: 1rem; border-bottom: 1px solid var(--border-subtle); overflow-x: auto;">
            ${years.map(y => `
              <div style="display: flex; flex-direction: column; align-items: center; min-width: 45px; flex: 1;">
                <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 4px;">${y.count}</span>
                <div style="width: 100%; max-width: 38px; height: ${Math.round((y.count / maxYearCount) * 180)}px; background: linear-gradient(180deg, #38bdf8, #0284c7); border-radius: 6px 6px 0 0;"></div>
                <span style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 8px;">${y.year}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }
};
