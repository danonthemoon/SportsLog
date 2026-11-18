import os
import json
import zipfile
import datetime
import xml.etree.ElementTree as ET
import pandas as pd
import numpy as np

BASE_DIR = '/Users/dsallu/.gemini/antigravity/scratch/sportslog'
NBA_DIR = os.path.join(BASE_DIR, 'NBA')
MLB_DIR = os.path.join(BASE_DIR, 'MLB')
SOCCER_DIR = os.path.join(BASE_DIR, 'soccer')
WEB_STATIC_DIR = os.path.join(BASE_DIR, 'web', 'static')
DOCS_DIR = os.path.join(BASE_DIR, 'docs')
os.makedirs(WEB_STATIC_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)

# ----------------------------------------------------
# 1. NBA DATA BUILDER
# ----------------------------------------------------
NBA_TEAMS = [
    {'name': 'Boston Celtics', 'abbrev': 'BOS', 'conf': 'Eastern', 'div': 'Atlantic', 'arena': 'TD Garden', 'city': 'Boston, MA', 'colors': ['#007A33', '#BA9653']},
    {'name': 'Brooklyn Nets', 'abbrev': 'BKN', 'conf': 'Eastern', 'div': 'Atlantic', 'arena': 'Barclays Center', 'city': 'Brooklyn, NY', 'colors': ['#000000', '#FFFFFF']},
    {'name': 'New York Knicks', 'abbrev': 'NYK', 'conf': 'Eastern', 'div': 'Atlantic', 'arena': 'Madison Square Garden', 'city': 'New York, NY', 'colors': ['#006BB6', '#F58426']},
    {'name': 'Philadelphia 76ers', 'abbrev': 'PHI', 'conf': 'Eastern', 'div': 'Atlantic', 'arena': 'Wells Fargo Center', 'city': 'Philadelphia, PA', 'colors': ['#006BB6', '#ED174C']},
    {'name': 'Toronto Raptors', 'abbrev': 'TOR', 'conf': 'Eastern', 'div': 'Atlantic', 'arena': 'Scotiabank Arena', 'city': 'Toronto, ON', 'colors': ['#CE1141', '#000000']},
    {'name': 'Chicago Bulls', 'abbrev': 'CHI', 'conf': 'Eastern', 'div': 'Central', 'arena': 'United Center', 'city': 'Chicago, IL', 'colors': ['#CE1141', '#000000']},
    {'name': 'Cleveland Cavaliers', 'abbrev': 'CLE', 'conf': 'Eastern', 'div': 'Central', 'arena': 'Rocket Mortgage FieldHouse', 'city': 'Cleveland, OH', 'colors': ['#860038', '#041E42']},
    {'name': 'Detroit Pistons', 'abbrev': 'DET', 'conf': 'Eastern', 'div': 'Central', 'arena': 'Little Caesars Arena', 'city': 'Detroit, MI', 'colors': ['#1D428A', '#C8102E']},
    {'name': 'Indiana Pacers', 'abbrev': 'IND', 'conf': 'Eastern', 'div': 'Central', 'arena': 'Gainbridge Fieldhouse', 'city': 'Indianapolis, IN', 'colors': ['#002D62', '#FDBB30']},
    {'name': 'Milwaukee Bucks', 'abbrev': 'MIL', 'conf': 'Eastern', 'div': 'Central', 'arena': 'Fiserv Forum', 'city': 'Milwaukee, WI', 'colors': ['#00471B', '#EEE1C6']},
    {'name': 'Atlanta Hawks', 'abbrev': 'ATL', 'conf': 'Eastern', 'div': 'Southeast', 'arena': 'State Farm Arena', 'city': 'Atlanta, GA', 'colors': ['#E03A3E', '#C1D32F']},
    {'name': 'Charlotte Hornets', 'abbrev': 'CHA', 'conf': 'Eastern', 'div': 'Southeast', 'arena': 'Spectrum Center', 'city': 'Charlotte, NC', 'colors': ['#1D1160', '#00788C']},
    {'name': 'Miami Heat', 'abbrev': 'MIA', 'conf': 'Eastern', 'div': 'Southeast', 'arena': 'Kaseya Center', 'city': 'Miami, FL', 'colors': ['#98002E', '#F9A01B']},
    {'name': 'Orlando Magic', 'abbrev': 'ORL', 'conf': 'Eastern', 'div': 'Southeast', 'arena': 'Kia Center', 'city': 'Orlando, FL', 'colors': ['#0077C0', '#C4CED4']},
    {'name': 'Washington Wizards', 'abbrev': 'WAS', 'conf': 'Eastern', 'div': 'Southeast', 'arena': 'Capital One Arena', 'city': 'Washington, D.C.', 'colors': ['#002B5C', '#E31837']},
    {'name': 'Denver Nuggets', 'abbrev': 'DEN', 'conf': 'Western', 'div': 'Northwest', 'arena': 'Ball Arena', 'city': 'Denver, CO', 'colors': ['#0E2240', '#FEC524']},
    {'name': 'Minnesota Timberwolves', 'abbrev': 'MIN', 'conf': 'Western', 'div': 'Northwest', 'arena': 'Target Center', 'city': 'Minneapolis, MN', 'colors': ['#0C2340', '#236192']},
    {'name': 'Oklahoma City Thunder', 'abbrev': 'OKC', 'conf': 'Western', 'div': 'Northwest', 'arena': 'Paycom Center', 'city': 'Oklahoma City, OK', 'colors': ['#007AC1', '#EF3B24']},
    {'name': 'Portland Trail Blazers', 'abbrev': 'POR', 'conf': 'Western', 'div': 'Northwest', 'arena': 'Moda Center', 'city': 'Portland, OR', 'colors': ['#E03A3E', '#000000']},
    {'name': 'Utah Jazz', 'abbrev': 'UTA', 'conf': 'Western', 'div': 'Northwest', 'arena': 'Delta Center', 'city': 'Salt Lake City, UT', 'colors': ['#002B5C', '#00471B']},
    {'name': 'Golden State Warriors', 'abbrev': 'GSW', 'conf': 'Western', 'div': 'Pacific', 'arena': 'Chase Center', 'city': 'San Francisco, CA', 'colors': ['#1D428A', '#FFC72C']},
    {'name': 'Los Angeles Clippers', 'abbrev': 'LAC', 'conf': 'Western', 'div': 'Pacific', 'arena': 'Intuit Dome', 'city': 'Inglewood, CA', 'colors': ['#C8102E', '#1D428A']},
    {'name': 'Los Angeles Lakers', 'abbrev': 'LAL', 'conf': 'Western', 'div': 'Pacific', 'arena': 'Crypto.com Arena', 'city': 'Los Angeles, CA', 'colors': ['#552583', '#FDB927']},
    {'name': 'Phoenix Suns', 'abbrev': 'PHX', 'conf': 'Western', 'div': 'Pacific', 'arena': 'Footprint Center', 'city': 'Phoenix, AZ', 'colors': ['#1D1160', '#E56020']},
    {'name': 'Sacramento Kings', 'abbrev': 'SAC', 'conf': 'Western', 'div': 'Pacific', 'arena': 'Golden 1 Center', 'city': 'Sacramento, CA', 'colors': ['#5A2D81', '#63727A']},
    {'name': 'Dallas Mavericks', 'abbrev': 'DAL', 'conf': 'Western', 'div': 'Southwest', 'arena': 'American Airlines Center', 'city': 'Dallas, TX', 'colors': ['#00538C', '#002B5E']},
    {'name': 'Houston Rockets', 'abbrev': 'HOU', 'conf': 'Western', 'div': 'Southwest', 'arena': 'Toyota Center', 'city': 'Houston, TX', 'colors': ['#CE1141', '#000000']},
    {'name': 'Memphis Grizzlies', 'abbrev': 'MEM', 'conf': 'Western', 'div': 'Southwest', 'arena': 'FedExForum', 'city': 'Memphis, TN', 'colors': ['#5D76A9', '#12173F']},
    {'name': 'New Orleans Pelicans', 'abbrev': 'NOP', 'conf': 'Western', 'div': 'Southwest', 'arena': 'Smoothie King Center', 'city': 'New Orleans, LA', 'colors': ['#0C2340', '#C8102E']},
    {'name': 'San Antonio Spurs', 'abbrev': 'SAS', 'conf': 'Western', 'div': 'Southwest', 'arena': 'Frost Bank Center', 'city': 'San Antonio, TX', 'colors': ['#C4CED4', '#000000']},
]
NBA_TEAM_BY_ABBREV = {t['abbrev']: t for t in NBA_TEAMS}

NBA_ARENAS_CATALOG = [
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
    {'name': 'Oracle Arena', 'team': 'Golden State Warriors (Former)', 'city': 'Oakland, CA', 'active': False, 'capacity': 19596, 'historical': True},
    {'name': 'Staples Center', 'team': 'LAL / LAC (Now Crypto.com Arena)', 'city': 'Los Angeles, CA', 'active': False, 'capacity': 19079, 'historical': True},
    {'name': 'Chesapeake Energy Arena', 'team': 'Oklahoma City Thunder (Now Paycom)', 'city': 'Oklahoma City, OK', 'active': False, 'capacity': 18203, 'historical': True},
    {'name': 'Pepsi Center', 'team': 'Denver Nuggets (Now Ball Arena)', 'city': 'Denver, CO', 'active': False, 'capacity': 19520, 'historical': True},
    {'name': 'Mortgage Matchup Center', 'team': 'Phoenix Suns (Footprint Center sponsored)', 'city': 'Phoenix, AZ', 'active': False, 'capacity': 17071, 'historical': True},
    {'name': 'T-Mobile Arena', 'team': 'NBA Cup / Las Vegas', 'city': 'Las Vegas, NV', 'active': False, 'capacity': 18000, 'historical': True, 'neutral': True},
]

NBA_MVPS = {
    'LeBron James', 'Nikola Jokic', 'Russell Westbrook', 'James Harden', 'Kevin Durant'
}
NBA_ALL_STARS = {
    'LeBron James', 'Nikola Jokic', 'Russell Westbrook', 'James Harden', 'Kevin Durant',
    'Shai Gilgeous-Alexander', 'Kawhi Leonard', 'Paul George', 'Anthony Davis', 'Chris Paul',
    'Devin Booker', 'Dwyane Wade', 'Carmelo Anthony', 'Bradley Beal', "De'Aaron Fox",
    'Domantas Sabonis', 'Tyrese Haliburton', 'Pascal Siakam', 'Rudy Gobert', 'Karl-Anthony Towns',
    'Jamal Murray', 'Jrue Holiday', 'Brook Lopez', 'Kyle Lowry', 'Jimmy Butler', 'Andre Iguodala',
    'Dwight Howard', 'Carlos Boozer', 'Elton Brand', 'Samuel Dalembert', 'Lou Williams',
    'Victor Oladipo', 'Gordon Hayward', 'Marc Gasol', 'Pau Gasol', 'Mike Conley', 'Kemba Walker',
    'Khris Middleton', 'Zach LaVine', 'Nikola Vucevic', 'DeMar DeRozan', 'Trae Young',
    'Donovan Mitchell', 'Bam Adebayo', 'Jayson Tatum', 'Jaylen Brown', 'Fred VanVleet',
    'Darius Garland', 'Jarrett Allen', 'Lauri Markkanen', 'Chet Holmgren', 'Jalen Williams'
}
NBA_ALL_NBA = {
    'LeBron James', 'Nikola Jokic', 'Russell Westbrook', 'James Harden', 'Kevin Durant',
    'Shai Gilgeous-Alexander', 'Kawhi Leonard', 'Paul George', 'Anthony Davis', 'Chris Paul',
    'Devin Booker', 'Dwyane Wade', 'Carmelo Anthony', "De'Aaron Fox", 'Domantas Sabonis',
    'Tyrese Haliburton', 'Pascal Siakam', 'Rudy Gobert', 'Karl-Anthony Towns', 'Jimmy Butler',
    'Andre Iguodala', 'Dwight Howard', 'Carlos Boozer', 'Elton Brand', 'Marc Gasol', 'Pau Gasol',
    'Kemba Walker', 'DeMar DeRozan', 'Trae Young', 'Donovan Mitchell', 'Jayson Tatum', 'Jaylen Brown'
}

MLB_MVPS = {
    'Mookie Betts', 'Christian Yelich', 'Bryce Harper', 'Freddie Freeman', 'Cody Bellinger',
    'Paul Goldschmidt', 'Clayton Kershaw', 'Justin Verlander', 'Max Scherzer', 'Roy Halladay', 'Blake Snell'
}
MLB_ALL_STARS = {
    'Manny Machado', 'Fernando Tatis Jr.', 'Juan Soto', 'Jackson Merrill', 'Jurickson Profar',
    'Xander Bogaerts', 'Luis Arraez', 'Ryan Howard', 'Chase Utley', 'Jimmy Rollins', 'Shane Victorino',
    'Cole Hamels', 'Roy Oswalt', 'Yu Darvish', 'Dylan Cease', 'Michael King', 'Joe Musgrove',
    'Trevor Cahill', 'Edwin Jackson', 'Mason Miller', 'Robert Suarez', 'Nolan Arenado', 'Justin Turner',
    'Nick Castellanos', 'Wil Myers', 'Josh Bell', 'Kyle Tucker', 'Teoscar Hernandez', 'Will Smith',
    'Max Muncy', 'Whit Merrifield', 'Salvador Perez', 'Bobby Witt Jr.', 'Christian Yelich', 'Mookie Betts',
    'Freddie Freeman', 'Cody Bellinger', 'Paul Goldschmidt', 'Clayton Kershaw', 'Justin Verlander',
    'Max Scherzer', 'Roy Halladay', 'Blake Snell', 'Brandon Woodruff', 'Taijuan Walker', 'Sean Manaea',
    'Michael Wacha', 'Raul Ibanez', 'Hunter Renfroe', 'Austin Hays', 'Alek Thomas', 'Jose Iglesias',
    'Jake Cronenworth', 'Carlos Santana', 'David Peralta', 'Jesse Winker', 'J.T. Realmuto', 'Kyle Schwarber',
    'Trea Turner', 'Brad Hand', 'Craig Kimbrel', 'Ian Kinsler', 'Howie Kendrick', 'Torii Hunter'
}

SOCCER_MVPS = {
    'Alex Morgan', 'Carli Lloyd', 'Tobin Heath', 'Christian Pulisic', 'Dusan Vlahovic',
    'Paulo Dybala', 'Angel Di Maria', 'Paul Pogba', 'Leonardo Bonucci', 'Federico Chiesa',
    'Patrik Schick', 'Alyssa Thompson', 'Jaedyn Shaw', 'Lynn Williams', 'Abby Dahlkemper',
    'Walker Zimmerman', 'Timothy Weah', 'Christen Press', 'Rose Lavelle', 'Naomi Girma', 'Kailen Sheridan'
}
SOCCER_ALL_STARS = SOCCER_MVPS

def build_nba():
    bs = pd.read_csv(os.path.join(NBA_DIR, 'nba_boxscores.csv'), index_col=[0])
    sl = pd.read_csv(os.path.join(NBA_DIR, 'nba_statlines.csv'), index_col=[0])

    def calc_gs(r):
        return round(r['PTS'] + 0.4*r['FGM'] - 0.7*r['FGA'] - 0.4*(r['FTA']-r['FTM']) + 0.7*r['OREB'] + 0.3*r['DREB'] + r['STL'] + 0.7*r['AST'] + 0.7*r['BLK'] - 0.4*r['PF'] - r['TO'], 1)

    sl['GAME_SCORE'] = sl.apply(calc_gs, axis=1)
    sl['DOUBLE_DOUBLE'] = ((sl['PTS']>=10).astype(int) + (sl['REB']>=10).astype(int) + (sl['AST']>=10).astype(int) + (sl['STL']>=10).astype(int) + (sl['BLK']>=10).astype(int)) >= 2
    sl['TRIPLE_DOUBLE'] = ((sl['PTS']>=10).astype(int) + (sl['REB']>=10).astype(int) + (sl['AST']>=10).astype(int) + (sl['STL']>=10).astype(int) + (sl['BLK']>=10).astype(int)) >= 3

    games = []
    for i in range(0, len(bs), 2):
        r1 = bs.iloc[i].to_dict()
        r2 = bs.iloc[i+1].to_dict()
        game_id = f"game_{i//2 + 1}"
        date = r1['DATE']
        arena = r1['ARENA']
        city = r1['CITY']
        note = r1['NOTE']

        if 'vs.' in str(r1['MATCHUP']):
            home_team, away_team = r1, r2
        else:
            home_team, away_team = r2, r1

        winner_abbrev = home_team['ABBREV'] if home_team['W/L'] == 'W' else away_team['ABBREV']
        margin = abs(home_team['PTS'] - away_team['PTS'])
        total_pts = home_team['PTS'] + away_team['PTS']

        game_sl = sl[
            (sl['DATE'] == date) &
            (((sl['TEAM'] == home_team['ABBREV']) & (sl['OPP'] == away_team['ABBREV'])) |
             ((sl['TEAM'] == away_team['ABBREV']) & (sl['OPP'] == home_team['ABBREV'])))
        ].copy()

        home_players = game_sl[game_sl['TEAM'] == home_team['ABBREV']].sort_values(by='PTS', ascending=False).to_dict(orient='records')
        away_players = game_sl[game_sl['TEAM'] == away_team['ABBREV']].sort_values(by='PTS', ascending=False).to_dict(orient='records')
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

    # Player Aggregates
    players_dict = {}
    for idx, row in sl.iterrows():
        pname = row['NAME']
        if pname not in players_dict:
            players_dict[pname] = {
                'name': pname, 'teams': set(), 'opponents': set(), 'games_count': 0, 'wins': 0, 'losses': 0,
                'mins': 0, 'pts': 0, 'reb': 0, 'ast': 0, 'stl': 0, 'blk': 0, 'fgm': 0, 'fga': 0, 'tpm': 0, 'tpa': 0,
                'ftm': 0, 'fta': 0, 'oreb': 0, 'dreb': 0, 'to': 0, 'pf': 0, 'double_doubles': 0, 'triple_doubles': 0,
                'highs': {'pts': 0, 'reb': 0, 'ast': 0, 'stl': 0, 'blk': 0, '3pm': 0, 'game_score': -99},
                'log': []
            }
        p = players_dict[pname]
        p['teams'].add(row['TEAM'])
        p['opponents'].add(row['OPP'])
        p['games_count'] += 1
        mins = int(row['MINS']) if not pd.isna(row['MINS']) else 0
        pts, reb, ast = int(row['PTS']), int(row['REB']), int(row['AST'])
        stl, blk = int(row['STL']), int(row['BLK'])
        fgm, fga = int(row['FGM']), int(row['FGA'])
        tpm, tpa = int(row['3PM']), int(row['3PA'])
        ftm, fta = int(row['FTM']), int(row['FTA'])
        oreb, dreb = int(row['OREB']), int(row['DREB'])
        to, pf = int(row['TO']), int(row['PF'])
        gs = float(row['GAME_SCORE'])

        p['mins'] += mins; p['pts'] += pts; p['reb'] += reb; p['ast'] += ast
        p['stl'] += stl; p['blk'] += blk; p['fgm'] += fgm; p['fga'] += fga
        p['tpm'] += tpm; p['tpa'] += tpa; p['ftm'] += ftm; p['fta'] += fta
        p['oreb'] += oreb; p['dreb'] += dreb; p['to'] += to; p['pf'] += pf
        if row['DOUBLE_DOUBLE']: p['double_doubles'] += 1
        if row['TRIPLE_DOUBLE']: p['triple_doubles'] += 1
        p['highs']['pts'] = max(p['highs']['pts'], pts)
        p['highs']['reb'] = max(p['highs']['reb'], reb)
        p['highs']['ast'] = max(p['highs']['ast'], ast)
        p['highs']['stl'] = max(p['highs']['stl'], stl)
        p['highs']['blk'] = max(p['highs']['blk'], blk)
        p['highs']['3pm'] = max(p['highs']['3pm'], tpm)
        p['highs']['game_score'] = max(p['highs']['game_score'], gs)

        matching_box = bs[(bs['DATE'] == row['DATE']) & (bs['ABBREV'] == row['TEAM'])]
        team_wl = matching_box.iloc[0]['W/L'] if len(matching_box) > 0 else 'N/A'
        if team_wl == 'W': p['wins'] += 1
        elif team_wl == 'L': p['losses'] += 1

        p['log'].append({
            'date': row['DATE'], 'team': row['TEAM'], 'opp': row['OPP'], 'wl': team_wl,
            'mins': mins, 'pts': pts, 'reb': reb, 'ast': ast, 'stl': stl, 'blk': blk,
            'fgm': fgm, 'fga': fga, 'fg_pct': round(fgm/fga, 3) if fga>0 else 0.0,
            'tpm': tpm, 'tpa': tpa, 'tp_pct': round(tpm/tpa, 3) if tpa>0 else 0.0,
            'ftm': ftm, 'fta': fta, 'ft_pct': round(ftm/fta, 3) if fta>0 else 0.0,
            'oreb': oreb, 'dreb': dreb, 'to': to, 'pf': pf, 'game_score': gs,
            'double_double': bool(row['DOUBLE_DOUBLE']), 'triple_double': bool(row['TRIPLE_DOUBLE']),
        })

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
        p['is_mvp'] = pname in NBA_MVPS
        p['is_all_star'] = pname in NBA_ALL_STARS
        p['is_all_nba'] = pname in NBA_ALL_NBA
        p['log'].sort(key=lambda x: x['date'], reverse=True)
        players_list.append(p)
    players_list.sort(key=lambda x: x['pts'], reverse=True)

    single_performances = []
    for idx, row in sl.iterrows():
        matching_box = bs[(bs['DATE'] == row['DATE']) & (bs['ABBREV'] == row['TEAM'])]
        arena = matching_box.iloc[0]['ARENA'] if len(matching_box) > 0 else ''
        note = matching_box.iloc[0]['NOTE'] if len(matching_box) > 0 else ''
        wl = matching_box.iloc[0]['W/L'] if len(matching_box) > 0 else ''
        single_performances.append({
            'name': row['NAME'], 'team': row['TEAM'], 'opp': row['OPP'], 'date': row['DATE'],
            'arena': arena, 'note': note, 'wl': wl, 'mins': int(row['MINS']) if not pd.isna(row['MINS']) else 0,
            'pts': int(row['PTS']), 'reb': int(row['REB']), 'ast': int(row['AST']), 'stl': int(row['STL']), 'blk': int(row['BLK']),
            'fgm': int(row['FGM']), 'fga': int(row['FGA']), 'fg_pct': float(row['FG%']),
            'tpm': int(row['3PM']), 'tpa': int(row['3PA']), 'ftm': int(row['FTM']), 'fta': int(row['FTA']),
            'dreb': int(row['DREB']), 'oreb': int(row['OREB']), 'to': int(row['TO']), 'pf': int(row['PF']),
            'game_score': float(row['GAME_SCORE']),
            'double_double': bool(row['DOUBLE_DOUBLE']), 'triple_double': bool(row['TRIPLE_DOUBLE']),
            'is_mvp': row['NAME'] in NBA_MVPS,
            'is_all_star': row['NAME'] in NBA_ALL_STARS,
            'is_all_nba': row['NAME'] in NBA_ALL_NBA,
        })

    seen_abbrevs = bs['ABBREV'].value_counts().to_dict()
    seen_arenas_counts = bs['ARENA'].value_counts().to_dict()

    trophy_teams = []
    for t in NBA_TEAMS:
        seen_count = seen_abbrevs.get(t['abbrev'], 0)
        team_games = bs[bs['ABBREV'] == t['abbrev']]
        wins = int((team_games['W/L'] == 'W').sum())
        losses = int((team_games['W/L'] == 'L').sum())
        trophy_teams.append({
            **t, 'seen': seen_count > 0, 'games_count': seen_count, 'wins': wins, 'losses': losses,
            'win_pct': round(wins / (wins + losses), 3) if (wins + losses) > 0 else 0.0,
            'dates_seen': sorted(team_games['DATE'].unique().tolist()),
            'arenas_seen': sorted(team_games['ARENA'].unique().tolist()),
        })

    trophy_arenas = []
    for a in NBA_ARENAS_CATALOG:
        visited_count = seen_arenas_counts.get(a['name'], 0)
        arena_games = bs[bs['ARENA'] == a['name']]
        dates_visited = sorted(arena_games['DATE'].unique().tolist())
        trophy_arenas.append({
            **a, 'visited': visited_count > 0, 'games_count': len(arena_games) // 2 if visited_count > 0 else 0,
            'dates_visited': dates_visited, 'first_game': dates_visited[0] if dates_visited else None, 'last_game': dates_visited[-1] if dates_visited else None,
        })

    milestones = [
        {'id': 'lebron_record', 'title': 'The Scoring King', 'category': 'Historic Milestone', 'icon': '👑', 'description': 'Witnessed LeBron James surpass Kareem Abdul-Jabbar as the NBA all-time leading scorer (38 pts vs OKC).', 'date': '2023-02-07', 'venue': 'Crypto.com Arena', 'unlocked': True, 'badge': 'Legendary', 'filter_target': '2023-02-07'},
        {'id': 'westbrook_50_tripdub', 'title': 'Historic 50-PT Triple Double', 'category': 'Historic Milestone', 'icon': '⚡', 'description': 'Witnessed Russell Westbrook record his historic 42nd triple-double of the season with 50 PTS, 16 REB, 10 AST and a buzzer-beating 3-pointer.', 'date': '2017-04-09', 'venue': 'Pepsi Center', 'unlocked': True, 'badge': 'Legendary', 'filter_target': '2017-04-09'},
        {'id': 'nba_finals_g7', 'title': 'World Champions Crowned (Finals G7)', 'category': 'Playoffs & Championship', 'icon': '🏆', 'description': 'Attended NBA Finals Game 7 to witness championship history (OKC 103, IND 91).', 'date': '2025-06-22', 'venue': 'Paycom Center', 'unlocked': True, 'badge': 'Championship', 'filter_target': '2025-06-22'},
        {'id': 'nba_finals_g2', 'title': 'NBA Finals Atmosphere (Finals G2)', 'category': 'Playoffs & Championship', 'icon': '💍', 'description': 'Attended NBA Finals Game 2 (OKC 123, IND 107).', 'date': '2025-06-08', 'venue': 'Paycom Center', 'unlocked': True, 'badge': 'Championship', 'filter_target': '2025-06-08'},
        {'id': 'nba_cup_vegas', 'title': 'Vegas Lights (NBA Cup Semis)', 'category': 'Tournaments', 'icon': '🎲', 'description': 'Attended the In-Season Tournament / NBA Cup Semifinals double-header in Las Vegas.', 'date': '2025-12-13', 'venue': 'T-Mobile Arena', 'unlocked': True, 'badge': 'Special Event', 'filter_target': '2025-12-13'},
        {'id': 'wcf_game', 'title': 'Western Conference Finals', 'category': 'Playoffs & Championship', 'icon': '🔥', 'description': 'Attended Western Conference Finals Game 4 (SAS vs OKC).', 'date': '2026-05-24', 'venue': 'Frost Bank Center', 'unlocked': True, 'badge': 'Playoffs', 'filter_target': '2026-05-24'},
        {'id': 'intuit_dome_charter', 'title': 'The Wall at Intuit Dome', 'category': 'Venues', 'icon': '🏟️', 'description': 'Attended multiple games at the revolutionary Intuit Dome in Inglewood (7 games attended).', 'date': '2024-2026', 'venue': 'Intuit Dome', 'unlocked': True, 'badge': 'Venue Hopper', 'filter_target': 'Intuit Dome'},
        {'id': '50_pt_club', 'title': 'Fifty-Piece Witness', 'category': 'Individual Brilliance', 'icon': '🎯', 'description': 'Watched Russell Westbrook explode for 50 PTS, 16 REB, 10 AST and a buzzer-beater at Pepsi Center.', 'date': '2017-04-09', 'venue': 'Pepsi Center', 'unlocked': True, 'badge': 'Scoring', 'filter_target': '2017-04-09'},
        {'id': 'coast_to_coast', 'title': 'Coast to Coast Hoops', 'category': 'Geography', 'icon': '✈️', 'description': 'Seen NBA basketball from the Atlantic coast (D.C., Philly, Brooklyn) to the Pacific (Bay Area, LA, Sacramento).', 'date': '2009-2026', 'venue': 'Across USA', 'unlocked': True, 'badge': 'Explorer', 'filter_target': ''},
        {'id': 'thunder_nation', 'title': 'Thunder Faithful', 'category': 'Fandom', 'icon': '⛈️', 'description': 'Attended 34 games featuring the Oklahoma City Thunder across multiple eras.', 'date': '2017-2026', 'venue': '10+ Venues', 'unlocked': True, 'badge': 'Superfan', 'filter_target': 'OKC'},
        {'id': 'triple_double_club', 'title': 'Triple-Double Royalty', 'category': 'Stat Master', 'icon': '🎩', 'description': 'Seen 9 triple-doubles live in person by Russell Westbrook, Nikola Jokic, and James Harden.', 'date': 'Various', 'venue': 'Various', 'unlocked': True, 'badge': 'Elite Stats', 'filter_target': 'Westbrook'},
        {'id': 'buzzer_beater_thriller', 'title': 'Down to the Wire', 'category': 'Game Thrills', 'icon': '⏱️', 'description': 'Attended 8 games decided by 3 points or fewer, including 1-point heartstoppers.', 'date': 'Various', 'venue': 'Various', 'unlocked': True, 'badge': 'Clutch', 'filter_target': 'thriller'},
    ]

    fun_records = {
        'most_pts': {'holder': 'Russell Westbrook', 'val': '50 PTS', 'opp': 'DEN', 'date': '2017-04-09', 'note': 'Historic 50-16-10 triple-double buzzer beater'},
        'most_3pm': {'holder': 'Jordan Goodwin', 'val': '8 3PM', 'opp': 'LAL', 'date': '2024-04-12', 'note': 'Shot 8-of-13 from 3-point range for Grizzlies'},
        'most_ast': {'holder': 'Russell Westbrook & James Harden', 'val': '16 AST', 'opp': 'Multiple', 'date': '2017 & 2024', 'note': 'Elite floor-general playmaking'},
        'most_reb': {'holder': 'Russell Westbrook & Ivica Zubac', 'val': '16 REB', 'opp': 'DEN & SAS', 'date': '2017 & 2026', 'note': 'Dominant on the glass'},
        'highest_scoring_game': {'val': '273 Total PTS', 'matchup': 'SAC 138, LAC 135', 'date': '2026-03-14', 'arena': 'Intuit Dome'},
        'closest_game': {'val': '1 Point Thriller', 'matchup': 'OKC 106, DEN 105', 'date': '2017-04-09', 'arena': 'Pepsi Center'},
        'biggest_blowout': {'val': '41 Point Blowout', 'matchup': 'GSW 141, LAC 100', 'date': '2017-01-28', 'arena': 'Oracle Arena'}
    }

    years_data = {}
    for g in games:
        yr = g['date'].split('-')[0]
        years_data[yr] = years_data.get(yr, 0) + 1
    attendance_by_year = [{'year': yr, 'count': years_data[yr]} for yr in sorted(years_data.keys())]

    team_records = []
    for abbrev, team_obj in NBA_TEAM_BY_ABBREV.items():
        team_bs = bs[bs['ABBREV'] == abbrev]
        if len(team_bs) > 0:
            w = int((team_bs['W/L'] == 'W').sum())
            l = int((team_bs['W/L'] == 'L').sum())
            team_records.append({
                'abbrev': abbrev, 'team': team_obj['name'], 'games': len(team_bs),
                'wins': w, 'losses': l, 'win_pct': round(w / (w + l), 3), 'colors': team_obj['colors']
            })
    team_records.sort(key=lambda x: x['games'], reverse=True)

    summary = {
        'total_games': len(games), 'total_statlines': len(sl), 'total_players_seen': len(players_list),
        'total_teams_seen': sum(1 for t in trophy_teams if t['seen']), 'total_teams_available': 30,
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

    return {
        'summary': summary, 'games': games, 'players': players_list, 'single_performances': single_performances,
        'trophy_teams': trophy_teams, 'trophy_arenas': trophy_arenas, 'milestones': milestones,
        'attendance_by_year': attendance_by_year, 'team_records': team_records, 'fun_records': fun_records
    }

# ----------------------------------------------------
# 2. MLB DATA BUILDER
# ----------------------------------------------------
MLB_TEAMS_DATA = [
    {'abbrev': 'BAL', 'name': 'Baltimore Orioles', 'league': 'AL', 'div': 'East', 'stadium': 'Oriole Park at Camden Yards', 'city': 'Baltimore, MD', 'colors': ['#DF4601', '#000000']},
    {'abbrev': 'BOS', 'name': 'Boston Red Sox', 'league': 'AL', 'div': 'East', 'stadium': 'Fenway Park', 'city': 'Boston, MA', 'colors': ['#BD3039', '#0C2340']},
    {'abbrev': 'NYY', 'name': 'New York Yankees', 'league': 'AL', 'div': 'East', 'stadium': 'Yankee Stadium', 'city': 'Bronx, NY', 'colors': ['#003087', '#E4002C']},
    {'abbrev': 'TBR', 'name': 'Tampa Bay Rays', 'league': 'AL', 'div': 'East', 'stadium': 'Tropicana Field', 'city': 'St. Petersburg, FL', 'colors': ['#092C5C', '#8FBCE6']},
    {'abbrev': 'TOR', 'name': 'Toronto Blue Jays', 'league': 'AL', 'div': 'East', 'stadium': 'Rogers Centre', 'city': 'Toronto, ON', 'colors': ['#134A8E', '#E8291C']},
    {'abbrev': 'CHW', 'name': 'Chicago White Sox', 'league': 'AL', 'div': 'Central', 'stadium': 'Guaranteed Rate Field', 'city': 'Chicago, IL', 'colors': ['#27251F', '#C4CED4']},
    {'abbrev': 'CLE', 'name': 'Cleveland Guardians', 'league': 'AL', 'div': 'Central', 'stadium': 'Progressive Field', 'city': 'Cleveland, OH', 'colors': ['#0C2340', '#E31937']},
    {'abbrev': 'DET', 'name': 'Detroit Tigers', 'league': 'AL', 'div': 'Central', 'stadium': 'Comerica Park', 'city': 'Detroit, MI', 'colors': ['#0C2340', '#FA4616']},
    {'abbrev': 'KCR', 'name': 'Kansas City Royals', 'league': 'AL', 'div': 'Central', 'stadium': 'Kauffman Stadium', 'city': 'Kansas City, MO', 'colors': ['#004687', '#BD9B60']},
    {'abbrev': 'MIN', 'name': 'Minnesota Twins', 'league': 'AL', 'div': 'Central', 'stadium': 'Target Field', 'city': 'Minneapolis, MN', 'colors': ['#002B5C', '#D31145']},
    {'abbrev': 'HOU', 'name': 'Houston Astros', 'league': 'AL', 'div': 'West', 'stadium': 'Minute Maid Park', 'city': 'Houston, TX', 'colors': ['#002D62', '#EB6E1F']},
    {'abbrev': 'LAA', 'name': 'Los Angeles Angels', 'league': 'AL', 'div': 'West', 'stadium': 'Angel Stadium', 'city': 'Anaheim, CA', 'colors': ['#BA0021', '#003263']},
    {'abbrev': 'OAK', 'name': 'Oakland Athletics', 'league': 'AL', 'div': 'West', 'stadium': 'Oakland Coliseum', 'city': 'Oakland, CA', 'colors': ['#003831', '#EFB21E']},
    {'abbrev': 'SEA', 'name': 'Seattle Mariners', 'league': 'AL', 'div': 'West', 'stadium': 'T-Mobile Park', 'city': 'Seattle, WA', 'colors': ['#0C2340', '#005C5C']},
    {'abbrev': 'TEX', 'name': 'Texas Rangers', 'league': 'AL', 'div': 'West', 'stadium': 'Globe Life Field', 'city': 'Arlington, TX', 'colors': ['#003278', '#C0111F']},
    {'abbrev': 'ATL', 'name': 'Atlanta Braves', 'league': 'NL', 'div': 'East', 'stadium': 'Truist Park', 'city': 'Atlanta, GA', 'colors': ['#CE1141', '#13274F']},
    {'abbrev': 'MIA', 'name': 'Miami Marlins', 'league': 'NL', 'div': 'East', 'stadium': 'loanDepot park', 'city': 'Miami, FL', 'colors': ['#00A3E0', '#EF3340']},
    {'abbrev': 'NYM', 'name': 'New York Mets', 'league': 'NL', 'div': 'East', 'stadium': 'Citi Field', 'city': 'Queens, NY', 'colors': ['#002D72', '#FF5910']},
    {'abbrev': 'PHI', 'name': 'Philadelphia Phillies', 'league': 'NL', 'div': 'East', 'stadium': 'Citizens Bank Park', 'city': 'Philadelphia, PA', 'colors': ['#E81828', '#002D72']},
    {'abbrev': 'WAS', 'name': 'Washington Nationals', 'league': 'NL', 'div': 'East', 'stadium': 'Nationals Park', 'city': 'Washington, DC', 'colors': ['#AB0003', '#14225A']},
    {'abbrev': 'CHC', 'name': 'Chicago Cubs', 'league': 'NL', 'div': 'Central', 'stadium': 'Wrigley Field', 'city': 'Chicago, IL', 'colors': ['#0E3386', '#CC3433']},
    {'abbrev': 'CIN', 'name': 'Cincinnati Reds', 'league': 'NL', 'div': 'Central', 'stadium': 'Great American Ball Park', 'city': 'Cincinnati, OH', 'colors': ['#C6011F', '#000000']},
    {'abbrev': 'MIL', 'name': 'Milwaukee Brewers', 'league': 'NL', 'div': 'Central', 'stadium': 'American Family Field', 'city': 'Milwaukee, WI', 'colors': ['#12284B', '#FFC52F']},
    {'abbrev': 'PIT', 'name': 'Pittsburgh Pirates', 'league': 'NL', 'div': 'Central', 'stadium': 'PNC Park', 'city': 'Pittsburgh, PA', 'colors': ['#FDB827', '#000000']},
    {'abbrev': 'STL', 'name': 'St. Louis Cardinals', 'league': 'NL', 'div': 'Central', 'stadium': 'Busch Stadium', 'city': 'St. Louis, MO', 'colors': ['#C41E3A', '#0C2340']},
    {'abbrev': 'ARI', 'name': 'Arizona Diamondbacks', 'league': 'NL', 'div': 'West', 'stadium': 'Chase Field', 'city': 'Phoenix, AZ', 'colors': ['#A71930', '#E3D4AD']},
    {'abbrev': 'COL', 'name': 'Colorado Rockies', 'league': 'NL', 'div': 'West', 'stadium': 'Coors Field', 'city': 'Denver, CO', 'colors': ['#33006F', '#C4CED4']},
    {'abbrev': 'LAD', 'name': 'Los Angeles Dodgers', 'league': 'NL', 'div': 'West', 'stadium': 'Dodger Stadium', 'city': 'Los Angeles, CA', 'colors': ['#005A9C', '#EF3E42']},
    {'abbrev': 'SDP', 'name': 'San Diego Padres', 'league': 'NL', 'div': 'West', 'stadium': 'Petco Park', 'city': 'San Diego, CA', 'colors': ['#2F241D', '#FFC425']},
    {'abbrev': 'SFG', 'name': 'San Francisco Giants', 'league': 'NL', 'div': 'West', 'stadium': 'Oracle Park', 'city': 'San Francisco, CA', 'colors': ['#FD5A1E', '#000000']},
]
MLB_TEAM_BY_ABBREV = {t['abbrev']: t for t in MLB_TEAMS_DATA}

BBREF_TO_STD = {
    'LAN': 'LAD', 'NYN': 'NYM', 'CHN': 'CHC', 'CHA': 'CHW', 'NYA': 'NYY',
    'SFN': 'SFG', 'SLN': 'STL', 'TBA': 'TBR', 'KCA': 'KCR', 'SDN': 'SDP',
    'WSN': 'WAS', 'ANA': 'LAA'
}

def norm_mlb_team(code):
    c = str(code).strip().upper()
    return BBREF_TO_STD.get(c, c)

def parse_mlb_date(d_str):
    parts = str(d_str).split('/')
    if len(parts) == 3:
        m, d, y = int(parts[0]), int(parts[1]), int(parts[2])
        year = 2000 + y if y < 50 else 1900 + y
        return f"{year:04d}-{m:02d}-{d:02d}"
    return str(d_str)

def build_mlb():
    games_df = pd.read_csv(os.path.join(MLB_DIR, 'all_games.csv'), index_col=[0])
    batting_df = pd.read_csv(os.path.join(MLB_DIR, 'all_batting.csv'), index_col=[0])
    pitching_df = pd.read_csv(os.path.join(MLB_DIR, 'all_pitching.csv'), index_col=[0])

    batting_df['Team_Norm'] = batting_df['Team'].apply(norm_mlb_team)
    batting_df['Opp_Norm'] = batting_df['Opp'].apply(norm_mlb_team)
    pitching_df['Team_Norm'] = pitching_df['Team'].apply(norm_mlb_team)
    pitching_df['Opp_Norm'] = pitching_df['Opp'].apply(norm_mlb_team)

    games = []
    for idx, g in games_df.iterrows():
        raw_date = g['Date']
        iso_date = parse_mlb_date(raw_date)
        home_abbrev = norm_mlb_team(g['Home'])
        away_abbrev = norm_mlb_team(g['Away'])
        home_runs = int(g['H'])
        away_runs = int(g['A'])
        winner = home_abbrev if home_runs > away_runs else away_abbrev
        stadium = str(g['Stadium'])
        duration = str(g['Duration']) if not pd.isna(g['Duration']) else ''
        attendance = str(g['Attendance']) if not pd.isna(g['Attendance']) else ''
        time_str = str(g['Time']) if not pd.isna(g['Time']) else ''

        # Match batting & pitching
        g_bat = batting_df[batting_df['Date'] == raw_date]
        g_pitch = pitching_df[pitching_df['Date'] == raw_date]

        home_bat = g_bat[g_bat['Team_Norm'] == home_abbrev].to_dict(orient='records')
        away_bat = g_bat[g_bat['Team_Norm'] == away_abbrev].to_dict(orient='records')
        home_pitch = g_pitch[g_pitch['Team_Norm'] == home_abbrev].to_dict(orient='records')
        away_pitch = g_pitch[g_pitch['Team_Norm'] == away_abbrev].to_dict(orient='records')

        home_hits = sum(int(p.get('H', 0)) for p in home_bat)
        away_hits = sum(int(p.get('H', 0)) for p in away_bat)
        home_hr = sum(int(p.get('HR', 0)) for p in home_bat)
        away_hr = sum(int(p.get('HR', 0)) for p in away_bat)

        # Top performers
        all_batters = home_bat + away_bat
        top_hitter = max(all_batters, key=lambda x: (int(x.get('HR', 0))*4 + int(x.get('H', 0))*2 + int(x.get('RBI', 0)))) if all_batters else None

        games.append({
            'game_id': f"mlb_game_{idx+1}",
            'raw_date': raw_date,
            'date': iso_date,
            'stadium': stadium,
            'duration': duration,
            'attendance': attendance,
            'time': time_str,
            'winner': winner,
            'margin': abs(home_runs - away_runs),
            'total_runs': home_runs + away_runs,
            'home': {
                'team': MLB_TEAM_BY_ABBREV.get(home_abbrev, {}).get('name', home_abbrev),
                'abbrev': home_abbrev,
                'runs': home_runs,
                'hits': home_hits,
                'hr': home_hr,
                'wl': 'W' if home_runs > away_runs else 'L',
                'batting': home_bat,
                'pitching': home_pitch
            },
            'away': {
                'team': MLB_TEAM_BY_ABBREV.get(away_abbrev, {}).get('name', away_abbrev),
                'abbrev': away_abbrev,
                'runs': away_runs,
                'hits': away_hits,
                'hr': away_hr,
                'wl': 'W' if away_runs > home_runs else 'L',
                'batting': away_bat,
                'pitching': away_pitch
            },
            'top_performer': {
                'name': top_hitter['Batting'], 'team': top_hitter['Team_Norm'],
                'line': f"{top_hitter.get('H',0)}-for-{top_hitter.get('AB',0)}, {top_hitter.get('HR',0)} HR, {top_hitter.get('RBI',0)} RBI"
            } if top_hitter else None
        })

    # Sort games descending
    games.sort(key=lambda x: x['date'], reverse=True)

    # Batting Aggregates
    bat_agg = {}
    for idx, r in batting_df.iterrows():
        bname = r['Batting']
        if bname not in bat_agg:
            bat_agg[bname] = {
                'name': bname, 'teams': set(), 'games_count': 0, 'ab': 0, 'r': 0, 'h': 0, 'hr': 0,
                'rbi': 0, 'bb': 0, 'so': 0, 'pa': 0, 'high_hr': 0, 'high_h': 0, 'high_rbi': 0, 'log': []
            }
        b = bat_agg[bname]
        b['teams'].add(r['Team_Norm'])
        b['games_count'] += 1
        ab = int(r['AB']) if not pd.isna(r['AB']) else 0
        runs = int(r['R']) if not pd.isna(r['R']) else 0
        hits = int(r['H']) if not pd.isna(r['H']) else 0
        hr = int(r['HR']) if not pd.isna(r['HR']) else 0
        rbi = int(r['RBI']) if not pd.isna(r['RBI']) else 0
        bb = int(r['BB']) if not pd.isna(r['BB']) else 0
        so = int(r['SO']) if not pd.isna(r['SO']) else 0
        pa = int(r['PA']) if not pd.isna(r['PA']) else 0

        b['ab'] += ab; b['r'] += runs; b['h'] += hits; b['hr'] += hr
        b['rbi'] += rbi; b['bb'] += bb; b['so'] += so; b['pa'] += pa
        b['high_hr'] = max(b['high_hr'], hr)
        b['high_h'] = max(b['high_h'], hits)
        b['high_rbi'] = max(b['high_rbi'], rbi)
        b['log'].append({
            'date': parse_mlb_date(r['Date']), 'team': r['Team_Norm'], 'opp': r['Opp_Norm'],
            'pos': str(r['Pos']), 'ab': ab, 'r': runs, 'h': hits, 'hr': hr, 'rbi': rbi, 'bb': bb, 'so': so
        })

    batters_list = []
    for bname, b in bat_agg.items():
        b['teams'] = sorted(list(b['teams']))
        b['primary_team'] = b['teams'][0] if b['teams'] else ''
        b['avg'] = round(b['h'] / b['ab'], 3) if b['ab'] > 0 else 0.0
        b['obp'] = round((b['h'] + b['bb']) / b['pa'], 3) if b['pa'] > 0 else 0.0
        b['is_mvp'] = b['name'] in MLB_MVPS
        b['is_all_star'] = b['name'] in MLB_ALL_STARS
        b['log'].sort(key=lambda x: x['date'], reverse=True)
        batters_list.append(b)
    batters_list.sort(key=lambda x: (x['hr'], x['h'], x['rbi']), reverse=True)

    # Pitching Aggregates
    pitch_agg = {}
    for idx, r in pitching_df.iterrows():
        pname = r['Pitching']
        if pname not in pitch_agg:
            pitch_agg[pname] = {
                'name': pname, 'teams': set(), 'games_count': 0, 'ip': 0.0, 'h': 0, 'r': 0,
                'er': 0, 'bb': 0, 'so': 0, 'hr': 0, 'pitches': 0, 'high_so': 0, 'high_ip': 0.0, 'log': []
            }
        p = pitch_agg[pname]
        p['teams'].add(r['Team_Norm'])
        p['games_count'] += 1
        ip = float(r['IP']) if not pd.isna(r['IP']) else 0.0
        h = int(r['H']) if not pd.isna(r['H']) else 0
        runs = int(r['R']) if not pd.isna(r['R']) else 0
        er = int(r['ER']) if not pd.isna(r['ER']) else 0
        bb = int(r['BB']) if not pd.isna(r['BB']) else 0
        so = int(r['SO']) if not pd.isna(r['SO']) else 0
        hr = int(r['HR']) if not pd.isna(r['HR']) else 0
        pit = int(r['Pit']) if not pd.isna(r['Pit']) and str(r['Pit']).replace('.','',1).isdigit() else 0

        p['ip'] = round(p['ip'] + ip, 1)
        p['h'] += h; p['r'] += runs; p['er'] += er; p['bb'] += bb; p['so'] += so; p['hr'] += hr; p['pitches'] += pit
        p['high_so'] = max(p['high_so'], so)
        p['high_ip'] = max(p['high_ip'], ip)
        p['log'].append({
            'date': parse_mlb_date(r['Date']), 'team': r['Team_Norm'], 'opp': r['Opp_Norm'],
            'ip': ip, 'h': h, 'r': runs, 'er': er, 'bb': bb, 'so': so, 'hr': hr, 'pit': pit
        })

    pitchers_list = []
    for pname, p in pitch_agg.items():
        p['teams'] = sorted(list(p['teams']))
        p['primary_team'] = p['teams'][0] if p['teams'] else ''
        p['era'] = round((p['er'] * 9) / p['ip'], 2) if p['ip'] >= 1.0 else 0.0
        p['whip'] = round((p['bb'] + p['h']) / p['ip'], 2) if p['ip'] >= 1.0 else 0.0
        p['is_mvp'] = p['name'] in MLB_MVPS
        p['is_all_star'] = p['name'] in MLB_ALL_STARS
        p['log'].sort(key=lambda x: x['date'], reverse=True)
        pitchers_list.append(p)
    pitchers_list.sort(key=lambda x: (x['so'], x['ip']), reverse=True)

    # Single Performances
    single_batting = []
    for idx, r in batting_df.iterrows():
        single_batting.append({
            'name': r['Batting'], 'pos': str(r['Pos']), 'team': r['Team_Norm'], 'opp': r['Opp_Norm'],
            'date': parse_mlb_date(r['Date']), 'ab': int(r.get('AB',0)), 'r': int(r.get('R',0)),
            'h': int(r.get('H',0)), 'hr': int(r.get('HR',0)), 'rbi': int(r.get('RBI',0)),
            'bb': int(r.get('BB',0)), 'so': int(r.get('SO',0)), 'details': str(r.get('Details','')) if not pd.isna(r.get('Details')) else '',
            'is_mvp': r['Batting'] in MLB_MVPS,
            'is_all_star': r['Batting'] in MLB_ALL_STARS,
        })

    single_pitching = []
    for idx, r in pitching_df.iterrows():
        single_pitching.append({
            'name': r['Pitching'], 'team': r['Team_Norm'], 'opp': r['Opp_Norm'],
            'date': parse_mlb_date(r['Date']), 'ip': float(r.get('IP',0.0)), 'h': int(r.get('H',0)),
            'r': int(r.get('R',0)), 'er': int(r.get('ER',0)), 'bb': int(r.get('BB',0)),
            'so': int(r.get('SO',0)), 'hr': int(r.get('HR',0)),
            'gsc': float(r.get('GSc',0.0)) if not pd.isna(r.get('GSc')) else 0.0,
            'pit': int(r['Pit']) if not pd.isna(r.get('Pit')) and str(r.get('Pit')).replace('.','',1).isdigit() else 0,
            'is_mvp': r['Pitching'] in MLB_MVPS,
            'is_all_star': r['Pitching'] in MLB_ALL_STARS,
        })

    # MLB Trophy Teams
    seen_mlb_teams_set = set()
    for g in games:
        seen_mlb_teams_set.add(g['home']['abbrev'])
        seen_mlb_teams_set.add(g['away']['abbrev'])

    trophy_teams = []
    for t in MLB_TEAMS_DATA:
        seen = t['abbrev'] in seen_mlb_teams_set
        games_count = sum(1 for g in games if g['home']['abbrev'] == t['abbrev'] or g['away']['abbrev'] == t['abbrev'])
        trophy_teams.append({
            **t, 'seen': seen, 'games_count': games_count
        })

    # MLB Trophy Ballparks
    seen_stadiums_counts = games_df['Stadium'].value_counts().to_dict()
    trophy_ballparks = []
    for s_name, count in sorted(seen_stadiums_counts.items(), key=lambda x: x[1], reverse=True):
        stadium_games = [g for g in games if g['stadium'] == s_name]
        trophy_ballparks.append({
            'name': s_name,
            'visited': True,
            'games_count': count,
            'first_game': stadium_games[-1]['date'] if stadium_games else '',
            'last_game': stadium_games[0]['date'] if stadium_games else ''
        })

    # MLB Milestones
    milestones = [
        {'id': 'machado_10hr', 'title': 'Manny Being Manny (10 HRs)', 'category': 'Power Hitter', 'icon': '💥', 'description': 'Witnessed Manny Machado blast 10 home runs live in person across 34 games.', 'date': '2019-2026', 'venue': 'Petco Park', 'unlocked': True, 'badge': 'Power Record', 'filter_target': 'SDP'},
        {'id': 'halladay_cgso', 'title': 'Roy Halladay Masterpiece', 'category': 'Pitching Gem', 'icon': '👑', 'description': 'Witnessed Hall of Famer Roy Halladay throw a 9.0 IP Complete Game Shutout with 9 SO and 0 BB (Citizens Bank Park).', 'date': '2010-05-01', 'venue': 'Citizens Bank Park', 'unlocked': True, 'badge': 'Legendary Gem', 'filter_target': '2010-05-01'},
        {'id': 'fenway_wrigley', 'title': 'Historic Cathedral Duo', 'category': 'Ballpark Quest', 'icon': '🏛️', 'description': 'Attended games at Fenway Park (opened 1912) and Wrigley Field (opened 1914) — baseball\'s two oldest sacred grounds.', 'date': '2011 & 2012', 'venue': 'Fenway / Wrigley', 'unlocked': True, 'badge': 'History', 'filter_target': 'Fenway'},
        {'id': 'petco_faithful', 'title': 'Petco Park Faithful (33 Games)', 'category': 'Home Ballpark', 'icon': '⚾', 'description': 'Attended 33 games at Petco Park in San Diego cheering on the Padres.', 'date': '2019-2026', 'venue': 'Petco Park', 'unlocked': True, 'badge': 'Superfan', 'filter_target': 'Petco Park'},
        {'id': 'darvish_k_king', 'title': 'Yu Darvish Strikeout King', 'category': 'Pitching Master', 'icon': '⚡', 'description': 'Watched Yu Darvish fan 30 batters across 5 electric starts in person.', 'date': '2021-2024', 'venue': 'Petco Park', 'unlocked': True, 'badge': 'Strikeout King', 'filter_target': 'Petco Park'},
        {'id': 'nlds_postseason', 'title': 'Postseason Intensity (NLDS)', 'category': 'Playoffs', 'icon': '🔥', 'description': 'Attended National League Division Series postseason action (NLDS Game 3 vs Dodgers, Oct 2024).', 'date': '2024-10-08', 'venue': 'Petco Park', 'unlocked': True, 'badge': 'Playoffs', 'filter_target': '2024-10-08'},
        {'id': 'california_circuit', 'title': 'Golden State Circuit', 'category': 'Geography', 'icon': '🌉', 'description': 'Visited all 5 California MLB ballparks: Dodger Stadium, Petco Park, Oracle Park, Angel Stadium, and Oakland Coliseum.', 'date': '2012-2026', 'venue': 'California', 'unlocked': True, 'badge': 'Explorer', 'filter_target': 'California'},
        {'id': 'mlb_90_pct', 'title': '27 of 30 MLB Franchises Seen', 'category': 'League Quest', 'icon': '🏆', 'description': 'Seen 27 out of 30 Major League Baseball teams live in person (90.0% completion!).', 'date': '2008-2026', 'venue': '13 Ballparks', 'unlocked': True, 'badge': 'Epic Quest', 'filter_target': ''}
    ]

    years_data = {}
    for g in games:
        yr = g['date'].split('-')[0]
        years_data[yr] = years_data.get(yr, 0) + 1
    attendance_by_year = [{'year': yr, 'count': years_data[yr]} for yr in sorted(years_data.keys())]

    # MLB Team Records
    team_records = []
    for t in MLB_TEAMS_DATA:
        abbrev = t['abbrev']
        if abbrev in seen_mlb_teams_set:
            t_games = [g for g in games if g['home']['abbrev'] == abbrev or g['away']['abbrev'] == abbrev]
            w = sum(1 for g in t_games if (g['home']['abbrev'] == abbrev and g['home']['wl'] == 'W') or (g['away']['abbrev'] == abbrev and g['away']['wl'] == 'W'))
            l = len(t_games) - w
            team_records.append({
                'abbrev': abbrev,
                'team': t['name'],
                'games': len(t_games),
                'wins': w,
                'losses': l,
                'win_pct': round(w / len(t_games), 3) if len(t_games) > 0 else 0.0,
                'colors': t['colors']
            })
    team_records.sort(key=lambda x: (x['games'], x['win_pct']), reverse=True)

    fun_records = {
        'most_hits': {'holder': 'Fernando Tatis Jr., Jackson Merrill & Wil Myers', 'val': '4 Hits', 'opp': 'Multiple', 'date': '2020-2024', 'note': '4-hit performance in a 9-inning game'},
        'most_hr': {'holder': 'Fernando Tatis Jr., Manny Machado & Justin Turner', 'val': '2 Home Runs', 'opp': 'Multiple', 'date': '2010-2024', 'note': 'Multi-home run display'},
        'most_so': {'holder': 'Trevor Cahill', 'val': '12 Strikeouts', 'opp': 'ARI', 'date': '2018-08-16', 'note': '12 Ks across 7.0 shutout IP for SDP'},
        'most_rbi': {'holder': 'Gavin Sheets', 'val': '5 RBIs', 'opp': 'DET', 'date': '2023-09-01', 'note': 'Grand slam & clutch run production'},
        'highest_scoring_game': {'val': '23 Combined Runs', 'matchup': 'SDP 13, COL 10', 'date': '2022-06-11', 'stadium': 'Petco Park'},
        'biggest_blowout': {'val': '10 Runs Margin', 'matchup': 'SDP 12, ARI 2', 'date': '2022-09-07', 'stadium': 'Petco Park'}
    }

    summary = {
        'total_games': len(games), 'total_batters_seen': len(batters_list), 'total_pitchers_seen': len(pitchers_list),
        'total_teams_seen': len(seen_mlb_teams_set), 'total_teams_available': 30,
        'teams_completion_pct': round(len(seen_mlb_teams_set) / 30 * 100, 1),
        'total_ballparks_visited': len(trophy_ballparks),
        'total_runs_seen': sum(g['total_runs'] for g in games),
        'avg_runs_per_game': round(sum(g['total_runs'] for g in games) / len(games), 1),
    }

    return {
        'summary': summary, 'games': games, 'batters': batters_list, 'pitchers': pitchers_list,
        'single_batting': single_batting, 'single_pitching': single_pitching,
        'trophy_teams': trophy_teams, 'trophy_ballparks': trophy_ballparks, 'milestones': milestones,
        'attendance_by_year': attendance_by_year, 'team_records': team_records, 'fun_records': fun_records
    }

# ----------------------------------------------------
# 3. SOCCER DATA BUILDER
# ----------------------------------------------------
def excel_date_to_str(serial):
    try:
        s = float(serial)
        base = datetime.datetime(1899, 12, 30)
        dt = base + datetime.timedelta(days=s)
        return dt.strftime('%Y-%m-%d')
    except:
        return str(serial)

def parse_soccer_date(d_str):
    parts = str(d_str).split('/')
    if len(parts) == 3:
        m, d, y = int(parts[0]), int(parts[1]), int(parts[2])
        year = 2000 + y if y < 50 else 1900 + y
        return f"{year:04d}-{m:02d}-{d:02d}"
    return str(d_str)

def build_soccer():
    gamelog_df = pd.read_csv(os.path.join(SOCCER_DIR, 'gamelog.csv'))

    matches = []
    seen_stadiums = {}
    seen_teams = set()

    for idx, r in gamelog_df.iterrows():
        raw_d = str(r.get('Date', ''))
        iso_d = parse_soccer_date(raw_d)
        home = str(r.get('Home', '')).strip()
        away = str(r.get('Away', '')).strip()
        stadium = str(r.get('Stadium', '')).strip()
        city = str(r.get('City', '')).strip()
        h_score_raw = str(r.get('H', '')).strip()
        a_score_raw = str(r.get('A', '')).strip()
        attendance = str(r.get('Attendance', '')) if not pd.isna(r.get('Attendance')) else ''

        seen_teams.add(home)
        seen_teams.add(away)
        seen_stadiums[stadium] = seen_stadiums.get(stadium, 0) + 1

        matches.append({
            'match_id': f"soccer_match_{idx+1}",
            'date': iso_d,
            'raw_date': raw_d,
            'home': home,
            'away': away,
            'home_score': h_score_raw,
            'away_score': a_score_raw,
            'stadium': stadium,
            'city': city,
            'attendance': attendance,
        })

    matches.sort(key=lambda x: x['date'], reverse=True)

    # Parse playerstats.xlsx via zipfile
    xlsx_path = os.path.join(SOCCER_DIR, 'playerstats.xlsx')
    players_dict = {}
    if os.path.exists(xlsx_path):
        with zipfile.ZipFile(xlsx_path) as z:
            shared_strings = []
            if 'xl/sharedStrings.xml' in z.namelist():
                tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
                for si in tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                    t = si.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                    shared_strings.append(t.text if t is not None else '')

            tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
            rows = []
            for row in tree.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
                cols = {}
                for c in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    ref = c.get('r')
                    col_letter = ''.join([ch for ch in ref if ch.isalpha()])
                    t = c.get('t')
                    v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    val = v.text if v is not None else ''
                    if t == 's' and val.isdigit():
                        val = shared_strings[int(val)]
                    cols[col_letter] = val
                rows.append(cols)

            for r in rows[1:]:
                pname = r.get('B')
                if pname and pname != 'Player':
                    if pname not in players_dict:
                        players_dict[pname] = {
                            'name': pname, 'pos': r.get('C', ''), 'teams': set(), 'opponents': set(),
                            'matches_count': 0, 'mins': 0, 'goals': 0, 'assists': 0, 'yc': 0, 'rc': 0, 'log': []
                        }
                    p = players_dict[pname]
                    team = r.get('D', '')
                    opp = r.get('E', '')
                    if team: p['teams'].add(team)
                    if opp: p['opponents'].add(opp)
                    p['matches_count'] += 1
                    mins = int(float(r.get('H', 0))) if r.get('H') and str(r.get('H')).replace('.','',1).isdigit() else 0
                    goals = int(float(r.get('I', 0))) if r.get('I') and str(r.get('I')).replace('.','',1).isdigit() else 0
                    assists = int(float(r.get('J', 0))) if r.get('J') and str(r.get('J')).replace('.','',1).isdigit() else 0
                    yc = int(float(r.get('K', 0))) if r.get('K') and str(r.get('K')).replace('.','',1).isdigit() else 0
                    rc = int(float(r.get('L', 0))) if r.get('L') and str(r.get('L')).replace('.','',1).isdigit() else 0
                    d_str = excel_date_to_str(r.get('N', ''))

                    p['mins'] += mins; p['goals'] += goals; p['assists'] += assists; p['yc'] += yc; p['rc'] += rc
                    p['log'].append({
                        'date': d_str, 'team': team, 'opp': opp, 'mins': mins, 'goals': goals, 'assists': assists,
                        'yc': yc, 'rc': rc, 'pos': r.get('C', '')
                    })

    soccer_players = []
    for pname, p in players_dict.items():
        p['teams'] = sorted(list(p['teams']))
        p['opponents'] = sorted(list(p['opponents']))
        p['primary_team'] = p['teams'][0] if p['teams'] else ''
        p['is_mvp'] = p['name'] in SOCCER_MVPS
        p['is_all_star'] = p['name'] in SOCCER_ALL_STARS
        p['log'].sort(key=lambda x: x['date'], reverse=True)
        soccer_players.append(p)
    soccer_players.sort(key=lambda x: (x['goals'], x['assists'], x['matches_count']), reverse=True)

    # Attach match top performers from playerstats if available
    for m in matches:
        d = m['date']
        day_players = []
        for p in soccer_players:
            for l in p['log']:
                if l['date'] == d:
                    day_players.append({'name': p['name'], 'team': l['team'], 'goals': l['goals'], 'assists': l['assists'], 'yc': l['yc'], 'rc': l['rc']})
        goalscorers = [dp for dp in day_players if dp['goals'] > 0]
        goalscorers.sort(key=lambda x: x['goals'], reverse=True)
        if goalscorers:
            top_g = goalscorers[0]
            m['top_performer'] = {'name': top_g['name'], 'team': top_g['team'], 'line': f"{top_g['goals']} Goal{'s' if top_g['goals']>1 else ''}"}
        elif day_players:
            m['top_performer'] = {'name': day_players[0]['name'], 'team': day_players[0]['team'], 'line': 'Featured Player'}
        else:
            m['top_performer'] = None

    trophy_stadiums = []
    for s_name, count in sorted(seen_stadiums.items(), key=lambda x: x[1], reverse=True):
        m_list = [m for m in matches if m['stadium'] == s_name]
        trophy_stadiums.append({
            'name': s_name, 'visited': True, 'matches_count': count,
            'city': m_list[0]['city'] if m_list else '',
            'first_match': m_list[-1]['date'] if m_list else '',
            'last_match': m_list[0]['date'] if m_list else ''
        })

    trophy_teams = sorted(list(seen_teams))

    milestones = [
        {'id': 'world_tour', 'title': 'Global Football Tour (3 Continents)', 'category': 'International', 'icon': '🌍', 'description': 'Attended football matches across North America, Europe, and Africa (Athens, Prague, Cape Town, Rome, Turin, California).', 'date': '2016-2024', 'venue': '12 Global Stadiums', 'unlocked': True, 'badge': 'World Tour', 'filter_target': ''},
        {'id': 'rose_bowl_clasico', 'title': 'Rose Bowl Super-Clasico', 'category': 'Club Giants', 'icon': '🌹', 'description': 'Witnessed European royalty Real Madrid vs. Juventus at the historic Rose Bowl (93,702 fans, July 2022).', 'date': '2022-07-30', 'venue': 'Rose Bowl, Pasadena', 'unlocked': True, 'badge': 'European Royalty', 'filter_target': 'Rose Bowl'},
        {'id': 'serie_a_pilgrimage', 'title': 'Serie A Double Header (Rome & Turin)', 'category': 'European Leagues', 'icon': '🇮🇹', 'description': 'Attended Juventus vs Napoli at Allianz Stadium (Turin) and Roma vs Milan at Stadio Olimpico (Rome) in the same week.', 'date': 'April 2023', 'venue': 'Allianz Stadium & Stadio Olimpico', 'unlocked': True, 'badge': 'Calcio', 'filter_target': 'Allianz Stadium'},
        {'id': 'euro_qualifier', 'title': 'European Championship Qualifier', 'category': 'International Competitions', 'icon': '🏆', 'description': 'Attended UEFA Euro Qualifiers live in Prague: Czech Republic vs. Bulgaria at Generali Arena.', 'date': '2019-06-07', 'venue': 'Generali Arena, Prague', 'unlocked': True, 'badge': 'UEFA', 'filter_target': 'Generali Arena'},
        {'id': 'uswnt_9_goal_explosion', 'title': 'USWNT 9-Goal Masterclass', 'category': 'National Team', 'icon': '🇺🇸', 'description': 'Witnessed the US Women\'s National Team dismantle Paraguay 9-0 at FirstEnergy Stadium in Cleveland.', 'date': '2021-09-16', 'venue': 'FirstEnergy Stadium', 'unlocked': True, 'badge': 'Goal Fest', 'filter_target': 'FirstEnergy Stadium'},
        {'id': 'snapdragon_wave', 'title': 'San Diego Wave Charter Fan', 'category': 'NWSL', 'icon': '🌊', 'description': 'Attended 19 San Diego Wave FC matches at Torero Stadium and Snapdragon Stadium cheering on Alex Morgan & Co.', 'date': '2022-2024', 'venue': 'Snapdragon Stadium', 'unlocked': True, 'badge': 'Club Charter', 'filter_target': 'Wave'},
        {'id': 'cape_town_derby', 'title': 'South African PSL Under Table Mountain', 'category': 'African Football', 'icon': '🇿🇦', 'description': 'Attended Cape Town City vs. Stellenbosch at Athlone Stadium in Cape Town, South Africa.', 'date': '2019-08-10', 'venue': 'Athlone Stadium, Cape Town', 'unlocked': True, 'badge': 'African Football', 'filter_target': 'Athlone Stadium'}
    ]

    years_data = {}
    for m in matches:
        yr = m['date'].split('-')[0]
        years_data[yr] = years_data.get(yr, 0) + 1
    attendance_by_year = [{'year': yr, 'count': years_data[yr]} for yr in sorted(years_data.keys())]

    fun_records = {
        'most_goals': {'holder': 'Alex Morgan', 'val': '4 Goals', 'opp': 'Gotham FC', 'date': '2022-05-07', 'note': '4-goal explosion in 4-0 San Diego Wave victory'},
        'most_yc': {'holder': 'Juventus vs. AC Milan', 'val': '8 Yellow Cards', 'opp': 'Serie A Match', 'date': '2023-04-29', 'note': '8 bookings in electric Stadio Olimpico clash'},
        'highest_attendance': {'holder': 'Real Madrid vs. Juventus', 'val': '93,702 Fans', 'opp': 'Champions Tour', 'date': '2022-07-30', 'note': 'Record crowd at the historic Rose Bowl in Pasadena'},
        'continents_visited': {'val': '3 Continents', 'details': 'Europe (Rome, Turin, Prague, Athens), Africa (Cape Town), North America (USA)'},
        'highest_scoring_match': {'val': '9 Goals Fest', 'matchup': 'USWNT 9, Paraguay 0', 'date': '2021-09-16', 'stadium': 'FirstEnergy Stadium, Cleveland'}
    }

    summary = {
        'total_matches': len(matches), 'total_stadiums': len(trophy_stadiums), 'total_teams': len(trophy_teams),
        'total_players_tracked': len(soccer_players), 'cities_visited': len(set(m['city'] for m in matches)),
    }

    return {
        'summary': summary, 'matches': matches, 'players': soccer_players,
        'trophy_stadiums': trophy_stadiums, 'trophy_teams': trophy_teams, 'milestones': milestones,
        'attendance_by_year': attendance_by_year, 'fun_records': fun_records
    }

def clean_nan_inf(obj):
    if isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return obj
    elif isinstance(obj, dict):
        return {k: clean_nan_inf(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan_inf(v) for v in obj]
    return obj

# ----------------------------------------------------
# MAIN BUILD PIPELINE
# ----------------------------------------------------
def build_all():
    print("Building NBA data...")
    nba_data = build_nba()

    print("Building MLB data...")
    mlb_data = build_mlb()

    print("Building Soccer data...")
    soccer_data = build_soccer()

    all_data = {
        'nba': nba_data,
        'mlb': mlb_data,
        'soccer': soccer_data,
        # Keep top-level keys for default NBA compatibility
        'summary': nba_data['summary'],
        'games': nba_data['games'],
        'players': nba_data['players'],
        'single_performances': nba_data['single_performances'],
        'trophy_teams': nba_data['trophy_teams'],
        'trophy_arenas': nba_data['trophy_arenas'],
        'milestones': nba_data['milestones'],
        'attendance_by_year': nba_data['attendance_by_year'],
        'team_records': nba_data['team_records'],
    }

    all_data = clean_nan_inf(all_data)

    # Write to web/static/data.json
    p1 = os.path.join(WEB_STATIC_DIR, 'data.json')
    with open(p1, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2)

    # Write to docs/data.json
    p2 = os.path.join(DOCS_DIR, 'data.json')
    with open(p2, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2)

    print(f"Data successfully generated at:\n  {p1}\n  {p2}")
    print(f"NBA: {len(nba_data['games'])} games | MLB: {len(mlb_data['games'])} games | Soccer: {len(soccer_data['matches'])} matches")

if __name__ == '__main__':
    build_all()
