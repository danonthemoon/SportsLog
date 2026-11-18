// records.js - Attendance Trends, Records, and Superlatives
const recordsComponent = {
  render() {
    const container = document.getElementById('records-view-container');
    if (!container || !app.data) return;

    const data = app.data;
    const years = data.attendance_by_year;
    const maxYearCount = Math.max(...years.map(y => y.count), 1);

    // Superlatives calculations
    const sortedByPts = [...data.games].sort((a, b) => b.total_pts - a.total_pts);
    const highestGame = sortedByPts[0];
    const lowestGame = sortedByPts[sortedByPts.length - 1];

    const sortedByMargin = [...data.games].sort((a, b) => b.margin - a.margin);
    const biggestBlowout = sortedByMargin[0];
    const closestGame = sortedByMargin[sortedByMargin.length - 1];

    const html = `
      <!-- Top Records Banner -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div class="kpi-card gold" style="padding: 1.25rem;">
          <div class="kpi-label">🔥 Highest Scoring Game</div>
          <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-gold);">${highestGame.total_pts} PTS</div>
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">
            ${highestGame.home.team} ${highestGame.home.pts} vs ${highestGame.away.team} ${highestGame.away.pts}
          </div>
          <div class="kpi-subtext">📅 ${highestGame.date} • 📍 ${highestGame.arena}</div>
        </div>

        <div class="kpi-card emerald" style="padding: 1.25rem;">
          <div class="kpi-label">⚡ Closest Finish</div>
          <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-emerald);">${closestGame.margin} PT Diff</div>
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">
            ${closestGame.home.team} ${closestGame.home.pts} vs ${closestGame.away.team} ${closestGame.away.pts}
          </div>
          <div class="kpi-subtext">📅 ${closestGame.date} • 📍 ${closestGame.arena}</div>
        </div>

        <div class="kpi-card purple" style="padding: 1.25rem;">
          <div class="kpi-label">🔨 Biggest Blowout</div>
          <div class="kpi-value" style="font-size: 1.8rem; color: var(--accent-purple);">${biggestBlowout.margin} PTS Margin</div>
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">
            ${biggestBlowout.home.team} ${biggestBlowout.home.pts} vs ${biggestBlowout.away.team} ${biggestBlowout.away.pts}
          </div>
          <div class="kpi-subtext">📅 ${biggestBlowout.date} • 📍 ${biggestBlowout.arena}</div>
        </div>

        <div class="kpi-card" style="padding: 1.25rem;">
          <div class="kpi-label">🛡️ Lowest Scoring Game</div>
          <div class="kpi-value" style="font-size: 1.8rem;">${lowestGame.total_pts} PTS</div>
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">
            ${lowestGame.home.team} ${lowestGame.home.pts} vs ${lowestGame.away.team} ${lowestGame.away.pts}
          </div>
          <div class="kpi-subtext">📅 ${lowestGame.date} • 📍 ${lowestGame.arena}</div>
        </div>
      </div>

      <!-- Attendance by Year (Interactive SVG Bar Chart) -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
        <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.25rem;">Attendance Timeline by Year (2009 - 2026)</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.5rem;">Number of games attended each calendar year.</p>

        <div style="display: flex; align-items: flex-end; gap: 1rem; height: 220px; padding-top: 1rem; border-bottom: 1px solid var(--border-subtle); overflow-x: auto;">
          ${years.map(y => {
            const heightPct = Math.round((y.count / maxYearCount) * 180);
            return `
              <div style="display: flex; flex-direction: column; align-items: center; min-width: 45px; flex: 1;">
                <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 4px;">${y.count}</span>
                <div style="width: 100%; max-width: 38px; height: ${heightPct}px; background: linear-gradient(180deg, #38bdf8, #0284c7); border-radius: 6px 6px 0 0; transition: height 0.5s ease; box-shadow: 0 0 10px rgba(56,189,248,0.2);"></div>
                <span style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 8px; font-weight: 600;">${y.year}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Personal Attendance Records by Team ("Your Luck with Each Team") -->
      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 800;">Your Attendance Luck by Team</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted);">How each team performs when you are sitting in the arena watching live.</p>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-secondary);">
            Home Teams: <strong style="color: var(--accent-cyan);">${data.summary.home_wins}W</strong> - <strong style="color: var(--accent-rose);">${data.summary.away_wins}L</strong> (${(data.summary.home_win_pct * 100).toFixed(0)}%)
          </div>
        </div>

        <div class="table-responsive">
          <table class="stats-table">
            <thead>
              <tr>
                <th class="text-left">Team</th>
                <th>Games Attended</th>
                <th>Wins</th>
                <th>Losses</th>
                <th style="color: var(--accent-cyan);">Win Rate In Person</th>
                <th class="text-left" style="width: 200px;">Record Bar</th>
              </tr>
            </thead>
            <tbody>
              ${data.team_records.map(tr => {
                const winPct = (tr.win_pct * 100).toFixed(0);
                return `
                  <tr>
                    <td class="text-left">
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="team-badge-circle" style="background: ${tr.colors[0]}; width: 26px; height: 26px; font-size: 0.7rem;">${tr.abbrev}</span>
                        <strong style="color: var(--text-primary);">${tr.team}</strong>
                      </div>
                    </td>
                    <td style="font-weight: 700;">${tr.games}</td>
                    <td style="color: var(--accent-emerald); font-weight: 700;">${tr.wins}</td>
                    <td style="color: var(--accent-rose); font-weight: 700;">${tr.losses}</td>
                    <td style="font-weight: 800; color: ${tr.win_pct >= 0.6 ? 'var(--accent-emerald)' : tr.win_pct <= 0.4 ? 'var(--accent-rose)' : 'var(--text-primary)'}; font-size: 0.9rem;">
                      ${winPct}%
                    </td>
                    <td class="text-left">
                      <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.08); border-radius: 9999px; overflow: hidden; display: flex;">
                        <div style="width: ${winPct}%; background: var(--accent-emerald);"></div>
                        <div style="width: ${100 - winPct}%; background: var(--accent-rose);"></div>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
};
