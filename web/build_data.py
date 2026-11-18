import os
import json
import pandas as pd
import numpy as np

BASE_DIR = '/Users/dsallu/.gemini/antigravity/scratch/sportslog'
NBA_DIR = os.path.join(BASE_DIR, 'NBA')
OUTPUT_DIR = os.path.join(BASE_DIR, 'web', 'static')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 30 NBA Teams Metadata
NBA_TEAMS = [
    # Eastern Conference - Atlantic
    {'name': 'Boston Celtics', 'abbrev': 'BOS', 'conf': 'Eastern', 'div': 'Atlantic', 'arena': 'TD Garden', 'city': 'Boston, MA', 'colors': ['#007A33', '#BA9653']},
    {'name': 'Brooklyn Nets', 'abbrev': 'BKN', 'conf': 'Eastern', 'div': 'Atlantic', 'arena': 'Barclays Center', 'city': 'Brooklyn, NY', 'colors': ['#000000', '#FFFFFF']},
    {'name': 'New York Knicks', 'abbrev': 'NYK', 'conf': 'Eastern', 'div': 'Atlantic', 'arena': 'Madison Square Garden', 'city': 'New York, NY', 'colors': ['#006BB6', '#F58426']},
    {'name': 'Philadelphia 76ers', 'abbrev': 'PHI', 'conf': 'Eastern', 'div': 'Atlantic', 'arena': 'Wells Fargo Center', 'city': 'Philadelphia, PA', 'colors': ['#006BB6', '#ED174C']},
    {'name': 'Toronto Raptors', 'abbrev': 'TOR', 'conf': 'Eastern', 'div': 'Atlantic', 'arena': 'Scotiabank Arena', 'city': 'Toronto, ON', 'colors': ['#CE1141', '#000000']},
    # Eastern Conference - Central
    {'name': 'Chicago Bulls', 'abbrev': 'CHI', 'conf': 'Eastern', 'div': 'Central', 'arena': 'United Center', 'city': 'Chicago, IL', 'colors': ['#CE1141', '#000000']},
    {'name': 'Cleveland Cavaliers', 'abbrev': 'CLE', 'conf': 'Eastern', 'div': 'Central', 'arena': 'Rocket Mortgage FieldHouse', 'city': 'Cleveland, OH', 'colors': ['#860038', '#041E42']},
    {'name': 'Detroit Pistons', 'abbrev': 'DET', 'conf': 'Eastern', 'div': 'Central', 'arena': 'Little Caesars Arena', 'city': 'Detroit, MI', 'colors': ['#1D428A', '#C8102E']},
    {'name': 'Indiana Pacers', 'abbrev': 'IND', 'conf': 'Eastern', 'div': 'Central', 'arena': 'Gainbridge Fieldhouse', 'city': 'Indianapolis, IN', 'colors': ['#002D62', '#FDBB30']},
    {'name': 'Milwaukee Bucks', 'abbrev': 'MIL', 'conf': 'Eastern', 'div': 'Central', 'arena': 'Fiserv Forum', 'city': 'Milwaukee, WI', 'colors': ['#00471B', '#EEE1C6']},
    # Eastern Conference - Southeast
    {'name': 'Atlanta Hawks', 'abbrev': 'ATL', 'conf': 'Eastern', 'div': 'Southeast', 'arena': 'State Farm Arena', 'city': 'Atlanta, GA', 'colors': ['#E03A3E', '#C1D32F']},
    {'name': 'Charlotte Hornets', 'abbrev': 'CHA', 'conf': 'Eastern', 'div': 'Southeast', 'arena': 'Spectrum Center', 'city': 'Charlotte, NC', 'colors': ['#1D1160', '#00788C']},
    {'name': 'Miami Heat', 'abbrev': 'MIA', 'conf': 'Eastern', 'div': 'Southeast', 'arena': 'Kaseya Center', 'city': 'Miami, FL', 'colors': ['#98002E', '#F9A01B']},
    {'name': 'Orlando Magic', 'abbrev': 'ORL', 'conf': 'Eastern', 'div': 'Southeast', 'arena': 'Kia Center', 'city': 'Orlando, FL', 'colors': ['#0077C0', '#C4CED4']},
    {'name': 'Washington Wizards', 'abbrev': 'WAS', 'conf': 'Eastern', 'div': 'Southeast', 'arena': 'Capital One Arena', 'city': 'Washington, D.C.', 'colors': ['#002B5C', '#E31837']},
    # Western Conference - Northwest
    {'name': 'Denver Nuggets', 'abbrev': 'DEN', 'conf': 'Western', 'div': 'Northwest', 'arena': 'Ball Arena', 'city': 'Denver, CO', 'colors': ['#0E2240', '#FEC524']},
    {'name': 'Minnesota Timberwolves', 'abbrev': 'MIN', 'conf': 'Western', 'div': 'Northwest', 'arena': 'Target Center', 'city': 'Minneapolis, MN', 'colors': ['#0C2340', '#236192']},
    {'name': 'Oklahoma City Thunder', 'abbrev': 'OKC', 'conf': 'Western', 'div': 'Northwest', 'arena': 'Paycom Center', 'city': 'Oklahoma City, OK', 'colors': ['#007AC1', '#EF3B24']},
    {'name': 'Portland Trail Blazers', 'abbrev': 'POR', 'conf': 'Western', 'div': 'Northwest', 'arena': 'Moda Center', 'city': 'Portland, OR', 'colors': ['#E03A3E', '#000000']},
    {'name': 'Utah Jazz', 'abbrev': 'UTA', 'conf': 'Western', 'div': 'Northwest', 'arena': 'Delta Center', 'city': 'Salt Lake City, UT', 'colors': ['#002B5C', '#00471B']},
    # Western Conference - Pacific
    {'name': 'Golden State Warriors', 'abbrev': 'GSW', 'conf': 'Western', 'div': 'Pacific', 'arena': 'Chase Center', 'city': 'San Francisco, CA', 'colors': ['#1D428A', '#FFC72C']},
    {'name': 'Los Angeles Clippers', 'abbrev': 'LAC', 'conf': 'Western', 'div': 'Pacific', 'arena': 'Intuit Dome', 'city': 'Inglewood, CA', 'colors': ['#C8102E', '#1D428A']},
    {'name': 'Los Angeles Lakers', 'abbrev': 'LAL', 'conf': 'Western', 'div': 'Pacific', 'arena': 'Crypto.com Arena', 'city': 'Los Angeles, CA', 'colors': ['#552583', '#FDB927']},
    {'name': 'Phoenix Suns', 'abbrev': 'PHX', 'conf': 'Western', 'div': 'Pacific', 'arena': 'Footprint Center', 'city': 'Phoenix, AZ', 'colors': ['#1D1160', '#E56020']},
    {'name': 'Sacramento Kings', 'abbrev': 'SAC', 'conf': 'Western', 'div': 'Pacific', 'arena': 'Golden 1 Center', 'city': 'Sacramento, CA', 'colors': ['#5A2D81', '#63727A']},
    # Western Conference - Southwest
    {'name': 'Dallas Mavericks', 'abbrev': 'DAL', 'conf': 'Western', 'div': 'Southwest', 'arena': 'American Airlines Center', 'city': 'Dallas, TX', 'colors': ['#00538C', '#002B5E']},
    {'name': 'Houston Rockets', 'abbrev': 'HOU', 'conf': 'Western', 'div': 'Southwest', 'arena': 'Toyota Center', 'city': 'Houston, TX', 'colors': ['#CE1141', '#000000']},
    {'name': 'Memphis Grizzlies', 'abbrev': 'MEM', 'conf': 'Western', 'div': 'Southwest', 'arena': 'FedExForum', 'city': 'Memphis, TN', 'colors': ['#5D76A9', '#12173F']},
    {'name': 'New Orleans Pelicans', 'abbrev': 'NOP', 'conf': 'Western', 'div': 'Southwest', 'arena': 'Smoothie King Center', 'city': 'New Orleans, LA', 'colors': ['#0C2340', '#C8102E']},
    {'name': 'San Antonio Spurs', 'abbrev': 'SAS', 'conf': 'Western', 'div': 'Southwest', 'arena': 'Frost Bank Center', 'city': 'San Antonio, TX', 'colors': ['#C4CED4', '#000000']},
]

TEAM_BY_ABBREV = {t['abbrev']: t for t in NBA_TEAMS}
TEAM_BY_NAME = {t['name']: t for t in NBA_TEAMS}

# Active & Historical Arenas
ARENAS_CATALOG = [
    # Active 30 Arenas
    {'name': 'American Airlines Center', 'team': 'Dallas Mavericks', 'city': 'Dallas, TX', 'active': True, 'capacity': 19200},
    {'name': 'Ball Arena', 'team': 'Denver Nuggets', 'city': 'Denver, CO', 'active': True, 'capacity': 19520},
    {'name': 'Barclays Center', 'team': 'Brooklyn Nets', 'city': 'Brooklyn, NY', 'active': True, 'capacity': 17732},
    {'name': 'Capital One Arena', 'team': 'Washington Wizards', 'city': 'Washington, D.C.', 'active': True, 'capacity': 20356},
    {'name': 'Chase Center', 'team': 'Golden State Warriors', 'city': 'San Francisco, CA', 'active': True, 'capacity': 18064},
    {'name': 'Crypto.com Arena', 'team': 'Los Angeles Lakers', 'city': 'Los Angeles, CA', 'active': True, 'capacity': 19079},
    {'name': 'Delta Center', 'team': 'Utah Jazz', 'city': 'Salt Lake City, UT', 'active': True, 'capacity': 18206},
    {'name': 'FedExForum', 'team': 'Memphis Grizzlies', 'city': 'Memphis, TN', 'active': True, 'capacity': 18119},
    {'name': 'Fiserv Forum', 'team': 'Milwaukee Bucks', 'city': 'Milwaukee, WI', 'active': True, 'capacity': 17341},
    {'name': 'Footprint Center', 'team': 'Phoenix Suns', 'city': 'Phoenix, AZ', 'active': True, 'capacity': 17071},
    {'name': 'Frost Bank Center', 'team': 'San Antonio Spurs', 'city': 'San Antonio, TX', 'active': True, 'capacity': 18418},
    {'name': 'Gainbridge Fieldhouse', 'team': 'Indiana Pacers', 'city': 'Indianapolis, IN', 'active': True, 'capacity': 17923},
    {'name': 'Golden 1 Center', 'team': 'Sacramento Kings', 'city': 'Sacramento, CA', 'active': True, 'capacity': 17608},
    {'name': 'Intuit Dome', 'team': 'Los Angeles Clippers', 'city': 'Inglewood, CA', 'active': True, 'capacity': 18000},
    {'name': 'Kaseya Center', 'team': 'Miami Heat', 'city': 'Miami, FL', 'active': True, 'capacity': 19600},
    {'name': 'Kia Center', 'team': 'Orlando Magic', 'city': 'Orlando, FL', 'active': True, 'capacity': 18846},
    {'name': 'Little Caesars Arena', 'team': 'Detroit Pistons', 'city': 'Detroit, MI', 'active': True, 'capacity': 20332},
    {'name': 'Madison Square Garden', 'team': 'New York Knicks', 'city': 'New York, NY', 'active': True, 'capacity': 19812},
    {'name': 'Moda Center', 'team': 'Portland Trail Blazers', 'city': 'Portland, OR', 'active': True, 'capacity': 19393},
    {'name': 'Paycom Center', 'team': 'Oklahoma City Thunder', 'city': 'Oklahoma City, OK', 'active': True, 'capacity': 18203},
    {'name': 'Rocket Mortgage FieldHouse', 'team': 'Cleveland Cavaliers', 'city': 'Cleveland, OH', 'active': True, 'capacity': 19432},
    {'name': 'Scotiabank Arena', 'team': 'Toronto Raptors', 'city': 'Toronto, ON', 'active': True, 'capacity': 19800},
    {'name': 'Smoothie King Center', 'team': 'New Orleans Pelicans', 'city': 'New Orleans, LA', 'active': True, 'capacity': 16867},
    {'name': 'Spectrum Center', 'team': 'Charlotte Hornets', 'city': 'Charlotte, NC', 'active': True, 'capacity': 19077},
    {'name': 'State Farm Arena', 'team': 'Atlanta Hawks', 'city': 'Atlanta, GA', 'active': True, 'capacity': 16600},
    {'name': 'Target Center', 'team': 'Minnesota Timberwolves', 'city': 'Minneapolis, MN', 'active': True, 'capacity': 18024},
    {'name': 'TD Garden', 'team': 'Boston Celtics', 'city': 'Boston, MA', 'active': True, 'capacity': 19156},
    {'name': 'Toyota Center', 'team': 'Houston Rockets', 'city': 'Houston, TX', 'active': True, 'capacity': 18055},
    {'name': 'United Center', 'team': 'Chicago Bulls', 'city': 'Chicago, IL', 'active': True, 'capacity': 20917},
    {'name': 'Wells Fargo Center', 'team': 'Philadelphia 76ers', 'city': 'Philadelphia, PA', 'active': True, 'capacity': 20478},
    # Historical / Former Names / Neutral Arenas Attended
    {'name': 'Oracle Arena', 'team': 'Golden State Warriors (Former)', 'city': 'Oakland, CA', 'active': False, 'capacity': 19596, 'historical': True},
    {'name': 'Staples Center', 'team': 'LAL / LAC (Now Crypto.com Arena)', 'city': 'Los Angeles, CA', 'active': False, 'capacity': 19079, 'historical': True},
    {'name': 'Chesapeake Energy Arena', 'team': 'Oklahoma City Thunder (Now Paycom Center)', 'city': 'Oklahoma City, OK', 'active': False, 'capacity': 18203, 'historical': True},
    {'name': 'Pepsi Center', 'team': 'Denver Nuggets (Now Ball Arena)', 'city': 'Denver, CO', 'active': False, 'capacity': 19520, 'historical': True},
    {'name': 'Mortgage Matchup Center', 'team': 'Phoenix Suns (Footprint Center sponsored)', 'city': 'Phoenix, AZ', 'active': False, 'capacity': 17071, 'historical': True},
    {'name': 'T-Mobile Arena', 'team': 'NBA Cup / Las Vegas', 'city': 'Las Vegas, NV', 'active': False, 'capacity': 18000, 'historical': True, 'neutral': True},
]

def calculate_game_score(row):
    # Hollinger Game Score
    return round(
        row['PTS'] + 0.4 * row['FGM'] - 0.7 * row['FGA'] - 0.4 * (row['FTA'] - row['FTM']) +
        0.7 * row['OREB'] + 0.3 * row['DREB'] + row['STL'] + 0.7 * row['AST'] + 0.7 * row['BLK'] -
        0.4 * row['PF'] - row['TO'], 1
    )

def is_double_double(row):
    cats = [row['PTS'] >= 10, row['REB'] >= 10, row['AST'] >= 10, row['STL'] >= 10, row['BLK'] >= 10]
    return sum(cats) >= 2

def is_triple_double(row):
    cats = [row['PTS'] >= 10, row['REB'] >= 10, row['AST'] >= 10, row['STL'] >= 10, row['BLK'] >= 10]
    return sum(cats) >= 3

def build():
    bs = pd.read_csv(os.path.join(NBA_DIR, 'nba_boxscores.csv'), index_col=[0])
    sl = pd.read_csv(os.path.join(NBA_DIR, 'nba_statlines.csv'), index_col=[0])

    # Enrich statlines
    sl['GAME_SCORE'] = sl.apply(calculate_game_score, axis=1)
    sl['DOUBLE_DOUBLE'] = sl.apply(is_double_double, axis=1)
    sl['TRIPLE_DOUBLE'] = sl.apply(is_triple_double, axis=1)

    games = []
    # Every 2 rows form 1 game
    for i in range(0, len(bs), 2):
        r1 = bs.iloc[i].to_dict()
        r2 = bs.iloc[i+1].to_dict()
        game_id = f"game_{i//2 + 1}"
        date = r1['DATE']
        arena = r1['ARENA']
        city = r1['CITY']
        note = r1['NOTE']

        # Determine Home and Away
        # If r1['MATCHUP'] contains 'vs.', r1 is Home, r2 is Away. If '@', r1 is Away, r2 is Home.
        if 'vs.' in str(r1['MATCHUP']):
            home_team = r1
            away_team = r2
        else:
            home_team = r2
            away_team = r1

        winner_abbrev = home_team['ABBREV'] if home_team['W/L'] == 'W' else away_team['ABBREV']
        margin = abs(home_team['PTS'] - away_team['PTS'])
        total_pts = home_team['PTS'] + away_team['PTS']

        # Filter player statlines for this game
        game_sl = sl[
            (sl['DATE'] == date) &
            (((sl['TEAM'] == home_team['ABBREV']) & (sl['OPP'] == away_team['ABBREV'])) |
             ((sl['TEAM'] == away_team['ABBREV']) & (sl['OPP'] == home_team['ABBREV'])))
        ].copy()

        home_players = game_sl[game_sl['TEAM'] == home_team['ABBREV']].sort_values(by='PTS', ascending=False).to_dict(orient='records')
        away_players = game_sl[game_sl['TEAM'] == away_team['ABBREV']].sort_values(by='PTS', ascending=False).to_dict(orient='records')

        # Top performers
        all_players_list = home_players + away_players
        top_scorer = max(all_players_list, key=lambda x: x['PTS']) if all_players_list else None
        top_rebounder = max(all_players_list, key=lambda x: x['REB']) if all_players_list else None
        top_assists = max(all_players_list, key=lambda x: x['AST']) if all_players_list else None
        top_game_score = max(all_players_list, key=lambda x: x['GAME_SCORE']) if all_players_list else None

        games.append({
            'game_id': game_id,
            'index': i // 2 + 1,
            'date': date,
            'arena': arena,
            'city': city,
            'note': note,
            'margin': margin,
            'total_pts': total_pts,
            'winner': winner_abbrev,
            'home': {
                'team': home_team['TEAM'],
                'abbrev': home_team['ABBREV'],
                'pts': int(home_team['PTS']),
                'wl': home_team['W/L'],
                'fgm': int(home_team['FGM']),
                'fga': int(home_team['FGA']),
                'fg_pct': float(home_team['FG%']),
                'tpm': int(home_team['3PM']),
                'tpa': int(home_team['3PA']),
                'tp_pct': float(home_team['3P%']),
                'ftm': int(home_team['FTM']),
                'fta': int(home_team['FTA']),
                'ft_pct': float(home_team['FT%']),
                'oreb': int(home_team['OREB']),
                'dreb': int(home_team['DREB']),
                'reb': int(home_team['REB']),
                'ast': int(home_team['AST']),
                'stl': int(home_team['STL']),
                'blk': int(home_team['BLK']),
                'to': int(home_team['TO']),
                'pf': int(home_team['PF']),
                'matchup': home_team['MATCHUP'],
                'players': home_players,
            },
            'away': {
                'team': away_team['TEAM'],
                'abbrev': away_team['ABBREV'],
                'pts': int(away_team['PTS']),
                'wl': away_team['W/L'],
                'fgm': int(away_team['FGM']),
                'fga': int(away_team['FGA']),
                'fg_pct': float(away_team['FG%']),
                'tpm': int(away_team['3PM']),
                'tpa': int(away_team['3PA']),
                'tp_pct': float(away_team['3P%']),
                'ftm': int(away_team['FTM']),
                'fta': int(away_team['FTA']),
                'ft_pct': float(away_team['FT%']),
                'oreb': int(away_team['OREB']),
                'dreb': int(away_team['DREB']),
                'reb': int(away_team['REB']),
                'ast': int(away_team['AST']),
                'stl': int(away_team['STL']),
                'blk': int(away_team['BLK']),
                'to': int(away_team['TO']),
                'pf': int(away_team['PF']),
                'matchup': away_team['MATCHUP'],
                'players': away_players,
            },
            'top_performers': {
                'scorer': {'name': top_scorer['NAME'], 'team': top_scorer['TEAM'], 'val': top_scorer['PTS']} if top_scorer else None,
                'rebounder': {'name': top_rebounder['NAME'], 'team': top_rebounder['TEAM'], 'val': top_rebounder['REB']} if top_rebounder else None,
                'playmaker': {'name': top_assists['NAME'], 'team': top_assists['TEAM'], 'val': top_assists['AST']} if top_assists else None,
                'mvp': {'name': top_game_score['NAME'], 'team': top_game_score['TEAM'], 'game_score': top_game_score['GAME_SCORE'], 'pts': top_game_score['PTS']} if top_game_score else None,
            }
        })

    # Build Player Directory & Aggregates
    players_dict = {}
    for idx, row in sl.iterrows():
        pname = row['NAME']
        if pname not in players_dict:
            players_dict[pname] = {
                'name': pname,
                'teams': set(),
                'opponents': set(),
                'games_count': 0,
                'wins': 0,
                'losses': 0,
                'mins': 0,
                'pts': 0,
                'reb': 0,
                'ast': 0,
                'stl': 0,
                'blk': 0,
                'fgm': 0,
                'fga': 0,
                'tpm': 0,
                'tpa': 0,
                'ftm': 0,
                'fta': 0,
                'oreb': 0,
                'dreb': 0,
                'to': 0,
                'pf': 0,
                'double_doubles': 0,
                'triple_doubles': 0,
                'highs': {
                    'pts': 0, 'reb': 0, 'ast': 0, 'stl': 0, 'blk': 0, '3pm': 0, 'game_score': -99
                },
                'log': []
            }
        p = players_dict[pname]
        p['teams'].add(row['TEAM'])
        p['opponents'].add(row['OPP'])
        p['games_count'] += 1
        mins = int(row['MINS']) if not pd.isna(row['MINS']) else 0
        pts = int(row['PTS'])
        reb = int(row['REB'])
        ast = int(row['AST'])
        stl = int(row['STL'])
        blk = int(row['BLK'])
        fgm = int(row['FGM'])
        fga = int(row['FGA'])
        tpm = int(row['3PM'])
        tpa = int(row['3PA'])
        ftm = int(row['FTM'])
        fta = int(row['FTA'])
        oreb = int(row['OREB'])
        dreb = int(row['DREB'])
        to = int(row['TO'])
        pf = int(row['PF'])
        gs = float(row['GAME_SCORE'])

        p['mins'] += mins
        p['pts'] += pts
        p['reb'] += reb
        p['ast'] += ast
        p['stl'] += stl
        p['blk'] += blk
        p['fgm'] += fgm
        p['fga'] += fga
        p['tpm'] += tpm
        p['tpa'] += tpa
        p['ftm'] += ftm
        p['fta'] += fta
        p['oreb'] += oreb
        p['dreb'] += dreb
        p['to'] += to
        p['pf'] += pf

        if row['DOUBLE_DOUBLE']:
            p['double_doubles'] += 1
        if row['TRIPLE_DOUBLE']:
            p['triple_doubles'] += 1

        p['highs']['pts'] = max(p['highs']['pts'], pts)
        p['highs']['reb'] = max(p['highs']['reb'], reb)
        p['highs']['ast'] = max(p['highs']['ast'], ast)
        p['highs']['stl'] = max(p['highs']['stl'], stl)
        p['highs']['blk'] = max(p['highs']['blk'], blk)
        p['highs']['3pm'] = max(p['highs']['3pm'], tpm)
        p['highs']['game_score'] = max(p['highs']['game_score'], gs)

        # Find outcome for player's team in that game
        matching_box = bs[(bs['DATE'] == row['DATE']) & (bs['ABBREV'] == row['TEAM'])]
        team_wl = matching_box.iloc[0]['W/L'] if len(matching_box) > 0 else 'N/A'
        if team_wl == 'W':
            p['wins'] += 1
        elif team_wl == 'L':
            p['losses'] += 1

        p['log'].append({
            'date': row['DATE'],
            'team': row['TEAM'],
            'opp': row['OPP'],
            'wl': team_wl,
            'mins': mins,
            'pts': pts,
            'reb': reb,
            'ast': ast,
            'stl': stl,
            'blk': blk,
            'fgm': fgm,
            'fga': fga,
            'fg_pct': round(fgm / fga, 3) if fga > 0 else 0.0,
            'tpm': tpm,
            'tpa': tpa,
            'tp_pct': round(tpm / tpa, 3) if tpa > 0 else 0.0,
            'ftm': ftm,
            'fta': fta,
            'ft_pct': round(ftm / fta, 3) if fta > 0 else 0.0,
            'oreb': oreb,
            'dreb': dreb,
            'to': to,
            'pf': pf,
            'game_score': gs,
            'double_double': bool(row['DOUBLE_DOUBLE']),
            'triple_double': bool(row['TRIPLE_DOUBLE']),
        })

    # Finalize player stats and averages
    players_list = []
    for pname, p in players_dict.items():
        gc = p['games_count']
        p['teams'] = sorted(list(p['teams']))
        p['opponents'] = sorted(list(p['opponents']))
        p['primary_team'] = p['teams'][0] if p['teams'] else ''
        p['ppg'] = round(p['pts'] / gc, 1)
        p['rpg'] = round(p['reb'] / gc, 1)
        p['apg'] = round(p['ast'] / gc, 1)
        p['spg'] = round(p['stl'] / gc, 1)
        p['bpg'] = round(p['blk'] / gc, 1)
        p['mpg'] = round(p['mins'] / gc, 1)
        p['fg_pct'] = round(p['fgm'] / p['fga'], 3) if p['fga'] > 0 else 0.0
        p['tp_pct'] = round(p['tpm'] / p['tpa'], 3) if p['tpa'] > 0 else 0.0
        p['ft_pct'] = round(p['ftm'] / p['fta'], 3) if p['fta'] > 0 else 0.0
        p['win_pct'] = round(p['wins'] / (p['wins'] + p['losses']), 3) if (p['wins'] + p['losses']) > 0 else 0.0
        p['log'].sort(key=lambda x: x['date'], reverse=True)
        players_list.append(p)

    players_list.sort(key=lambda x: x['pts'], reverse=True)

    # Single Game Performances (for sorting on any stat)
    single_performances = []
    for idx, row in sl.iterrows():
        matching_box = bs[(bs['DATE'] == row['DATE']) & (bs['ABBREV'] == row['TEAM'])]
        arena = matching_box.iloc[0]['ARENA'] if len(matching_box) > 0 else ''
        note = matching_box.iloc[0]['NOTE'] if len(matching_box) > 0 else ''
        wl = matching_box.iloc[0]['W/L'] if len(matching_box) > 0 else ''

        single_performances.append({
            'name': row['NAME'],
            'team': row['TEAM'],
            'opp': row['OPP'],
            'date': row['DATE'],
            'arena': arena,
            'note': note,
            'wl': wl,
            'mins': int(row['MINS']) if not pd.isna(row['MINS']) else 0,
            'pts': int(row['PTS']),
            'reb': int(row['REB']),
            'ast': int(row['AST']),
            'stl': int(row['STL']),
            'blk': int(row['BLK']),
            'fgm': int(row['FGM']),
            'fga': int(row['FGA']),
            'fg_pct': float(row['FG%']),
            'tpm': int(row['3PM']),
            'tpa': int(row['3PA']),
            'ftm': int(row['FTM']),
            'fta': int(row['FTA']),
            'dreb': int(row['DREB']),
            'oreb': int(row['OREB']),
            'to': int(row['TO']),
            'pf': int(row['PF']),
            'game_score': float(row['GAME_SCORE']),
            'double_double': bool(row['DOUBLE_DOUBLE']),
            'triple_double': bool(row['TRIPLE_DOUBLE']),
        })

    # Build Trophy Case
    # Teams seen
    seen_teams_counts = bs['TEAM'].value_counts().to_dict()
    seen_abbrevs = bs['ABBREV'].value_counts().to_dict()
    seen_arenas_counts = bs['ARENA'].value_counts().to_dict()

    trophy_teams = []
    for t in NBA_TEAMS:
        seen_count = seen_abbrevs.get(t['abbrev'], 0)
        team_games = bs[bs['ABBREV'] == t['abbrev']]
        wins = int((team_games['W/L'] == 'W').sum())
        losses = int((team_games['W/L'] == 'L').sum())
        win_pct = round(wins / (wins + losses), 3) if (wins + losses) > 0 else 0.0
        dates_seen = sorted(team_games['DATE'].unique().tolist())
        arenas_seen = sorted(team_games['ARENA'].unique().tolist())

        trophy_teams.append({
            **t,
            'seen': seen_count > 0,
            'games_count': seen_count,
            'wins': wins,
            'losses': losses,
            'win_pct': win_pct,
            'dates_seen': dates_seen,
            'arenas_seen': arenas_seen,
        })

    # Arenas Trophy Case
    trophy_arenas = []
    for a in ARENAS_CATALOG:
        visited_count = seen_arenas_counts.get(a['name'], 0)
        arena_games = bs[bs['ARENA'] == a['name']]
        dates_visited = sorted(arena_games['DATE'].unique().tolist())
        trophy_arenas.append({
            **a,
            'visited': visited_count > 0,
            'games_count': len(arena_games) // 2 if visited_count > 0 else 0,
            'dates_visited': dates_visited,
            'first_game': dates_visited[0] if dates_visited else None,
            'last_game': dates_visited[-1] if dates_visited else None,
        })

    # Milestone Badges Unlocked
    milestones = [
        {
            'id': 'lebron_record',
            'title': 'The Scoring King',
            'category': 'Historic Milestone',
            'icon': '👑',
            'description': 'Witnessed LeBron James surpass Kareem Abdul-Jabbar as the NBA all-time leading scorer (38 pts vs OKC).',
            'date': '2023-02-07',
            'venue': 'Crypto.com Arena',
            'unlocked': True,
            'badge': 'Legendary'
        },
        {
            'id': 'westbrook_50_tripdub',
            'title': 'Historic 50-PT Triple Double',
            'category': 'Historic Milestone',
            'icon': '⚡',
            'description': 'Witnessed Russell Westbrook record his 42nd triple-double of the season with 50 PTS, 16 REB, 10 AST and a game-winning buzzer beater.',
            'date': '2017-04-09',
            'venue': 'Pepsi Center',
            'unlocked': True,
            'badge': 'Legendary'
        },
        {
            'id': 'nba_finals_g7',
            'title': 'World Champions Crowned (Finals G7)',
            'category': 'Playoffs & Championship',
            'icon': '🏆',
            'description': 'Attended NBA Finals Game 7 to witness basketball championship history (OKC 103, IND 91).',
            'date': '2025-06-22',
            'venue': 'Paycom Center',
            'unlocked': True,
            'badge': 'Championship'
        },
        {
            'id': 'nba_finals_g2',
            'title': 'NBA Finals Atmosphere (Finals G2)',
            'category': 'Playoffs & Championship',
            'icon': '💍',
            'description': 'Attended NBA Finals Game 2 (OKC 123, IND 107).',
            'date': '2025-06-08',
            'venue': 'Paycom Center',
            'unlocked': True,
            'badge': 'Championship'
        },
        {
            'id': 'nba_cup_vegas',
            'title': 'Vegas Lights (NBA Cup Semis)',
            'category': 'Tournaments',
            'icon': '🎲',
            'description': 'Attended the In-Season Tournament / NBA Cup Semifinals double-header in Las Vegas.',
            'date': '2025-12-13',
            'venue': 'T-Mobile Arena',
            'unlocked': True,
            'badge': 'Special Event'
        },
        {
            'id': 'wcf_game',
            'title': 'Western Conference Finals',
            'category': 'Playoffs & Championship',
            'icon': '🔥',
            'description': 'Attended Western Conference Finals Game 4 (SAS vs OKC).',
            'date': '2026-05-24',
            'venue': 'Frost Bank Center',
            'unlocked': True,
            'badge': 'Playoffs'
        },
        {
            'id': 'intuit_dome_charter',
            'title': 'The Wall at Intuit Dome',
            'category': 'Venues',
            'icon': '🏟️',
            'description': 'Attended multiple games at Steve Ballmer\'s revolutionary Intuit Dome in Inglewood during its inaugural seasons (5 games attended).',
            'date': '2024-2026',
            'venue': 'Intuit Dome',
            'unlocked': True,
            'badge': 'Venue Hopper'
        },
        {
            'id': '50_pt_club',
            'title': 'Fifty-Piece Witness',
            'category': 'Individual Brilliance',
            'icon': '🎯',
            'description': 'Watched an NBA player explode for 50 or more points in a single live game.',
            'date': '2017-04-09',
            'venue': 'Pepsi Center',
            'unlocked': True,
            'badge': 'Scoring'
        },
        {
            'id': 'coast_to_coast',
            'title': 'Coast to Coast Hoops',
            'category': 'Geography',
            'icon': '✈️',
            'description': 'Seen NBA basketball from the Atlantic coast (D.C., Philly, Brooklyn) to the Pacific (Bay Area, LA, Sacramento).',
            'date': '2009-2026',
            'venue': 'Across USA',
            'unlocked': True,
            'badge': 'Explorer'
        },
        {
            'id': 'thunder_nation',
            'title': 'Thunder Faithful',
            'category': 'Fandom',
            'icon': '⛈️',
            'description': 'Attended 35 games featuring the Oklahoma City Thunder across multiple eras (Westbrook/George -> SGA/Chet/JDub).',
            'date': '2017-2026',
            'venue': '10+ Venues',
            'unlocked': True,
            'badge': 'Superfan'
        },
        {
            'id': 'triple_double_club',
            'title': 'Triple-Double Royalty',
            'category': 'Stat Master',
            'icon': '🎩',
            'description': 'Seen 7 triple-doubles live in person by Russell Westbrook, Nikola Jokic, and James Harden.',
            'date': 'Various',
            'venue': 'Various',
            'unlocked': True,
            'badge': 'Elite Stats'
        },
        {
            'id': 'buzzer_beater_thriller',
            'title': 'Down to the Wire',
            'category': 'Game Thrills',
            'icon': '⏱️',
            'description': 'Attended 8 games decided by 3 points or fewer, including 1-point heartstoppers.',
            'date': 'Various',
            'venue': 'Various',
            'unlocked': True,
            'badge': 'Clutch'
        }
    ]

    # Attendance by Year
    years_data = {}
    for g in games:
        yr = g['date'].split('-')[0]
        years_data[yr] = years_data.get(yr, 0) + 1
    attendance_by_year = [{'year': yr, 'count': years_data[yr]} for yr in sorted(years_data.keys())]

    # Team Records when user attended
    team_records = []
    for abbrev, team_obj in TEAM_BY_ABBREV.items():
        team_bs = bs[bs['ABBREV'] == abbrev]
        if len(team_bs) > 0:
            w = int((team_bs['W/L'] == 'W').sum())
            l = int((team_bs['W/L'] == 'L').sum())
            team_records.append({
                'abbrev': abbrev,
                'team': team_obj['name'],
                'games': len(team_bs),
                'wins': w,
                'losses': l,
                'win_pct': round(w / (w + l), 3),
                'colors': team_obj['colors']
            })
    team_records.sort(key=lambda x: x['games'], reverse=True)

    summary = {
        'total_games': len(games),
        'total_statlines': len(sl),
        'total_players_seen': len(players_list),
        'total_teams_seen': sum(1 for t in trophy_teams if t['seen']),
        'total_teams_available': 30,
        'teams_completion_pct': round(sum(1 for t in trophy_teams if t['seen']) / 30 * 100, 1),
        'total_active_arenas_seen': sum(1 for a in trophy_arenas if a.get('active') and a['visited']),
        'total_active_arenas_available': 30,
        'arenas_completion_pct': round(sum(1 for a in trophy_arenas if a.get('active') and a['visited']) / 30 * 100, 1),
        'total_historic_arenas_seen': sum(1 for a in trophy_arenas if not a.get('active') and a['visited']),
        'total_points_seen': sum(g['total_pts'] for g in games),
        'avg_points_per_game': round(sum(g['total_pts'] for g in games) / len(games), 1),
        'home_wins': sum(1 for g in games if g['home']['wl'] == 'W'),
        'away_wins': sum(1 for g in games if g['away']['wl'] == 'W'),
        'home_win_pct': round(sum(1 for g in games if g['home']['wl'] == 'W') / len(games), 3),
    }

    full_data = {
        'summary': summary,
        'games': games,
        'players': players_list,
        'single_performances': single_performances,
        'trophy_teams': trophy_teams,
        'trophy_arenas': trophy_arenas,
        'milestones': milestones,
        'attendance_by_year': attendance_by_year,
        'team_records': team_records,
    }

    output_path = os.path.join(OUTPUT_DIR, 'data.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(full_data, f, indent=2)

    print(f"Data successfully generated at {output_path}!")
    print(f"Games: {len(games)} | Players: {len(players_list)} | Single Performances: {len(single_performances)}")
    print(f"Summary: {summary}")

if __name__ == '__main__':
    build()
