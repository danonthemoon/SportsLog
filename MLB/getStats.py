#!/usr/bin/env python3
from bs4 import BeautifulSoup
from datetime import datetime
import pandas as pd
import urllib.request
import requests
import re
import json as JSON
import sqlite3
from sqlite3 import Error
import sys

def usage():
    print()
    print('-------------------------------------------------------------------------------')
    print("  getStats.py is a script to get box score data from a specified MLB game")
    print('-------------------------------------------------------------------------------')
    print()
    print("Usage:   getStats.py TEAMABBREV DATE")
    print()
    print()
    print("Example: getStats.py SDP 20221001")
    print()
    sys.exit(0)



gameDate, startTime, attendance, stadium, gameDur = " " * 5
teams = { 'CHC': 'CHN',
            'CHW': 'CHA',
            'KCR': 'KCA',
            'LAA': 'ANA',
            'LAD': 'LAN',
            'NYM': 'NYN',
            'SDP': 'SDN',
            'SFG': 'SFN',
            'STL': 'SLN',
            'TBR': 'TBA'}

battingNames = {"ATL":"AtlantaBravesbatting",
                    "ARI":"ArizonaDiamondbacksbatting",
                    "BAL":"BaltimoreOriolesbatting",
                    "BOS":"BostonRedSoxbatting",
                    "CHN":"ChicagoCubsbatting",
                    "CHA":"ChicagoWhiteSoxbatting",
                    "CIN":"CincinnatiRedsbatting",
                    "CLE":"ClevelandGuardiansbatting",
                    "COL":"ColoradoRockiesbatting",
                    "DET":"DetroitTigersbatting",
                    "KCA":"KansasCityRoyalsbatting",
                    "HOU":"HoustonAstrosbatting",
                    "ANA":"AnaheimAngelsbatting",
                    "LAN":"LosAngelesDodgersbatting",
                    "MIA":"MiamiMarlinsbatting",
                    "MIL":"MilwaukeeBrewersbatting",
                    "MIN":"MinnesotaTwinsbatting",
                    "NYN":"NewYorkMetsbatting",
                    "NYY":"NewYorkYankeesbatting",
                    "OAK":"OaklandAthleticsbatting",
                    "PHI":"PhiladelphiaPhilliesbatting",
                    "PIT":"PittsburghPiratesbatting",
                    "SDN":"SanDiegoPadresbatting",
                    "SEA":"SeattleMarinersbatting",
                    "SFN":"SanFranciscoGiantsbatting",
                    "SLN":"StLouisCardinalsbatting",
                    "TBA":"TampaBayRaysbatting",
                    "TEX":"TexasRangersbatting",
                    "TOR":"TorontoBlueJaysbatting",
                    "WAS":"WashingtonNationalsbatting"}

pitchingNames = {"ATL":"AtlantaBravespitching",
                    "ARI":"ArizonaDiamondbackspitching",
                    "BAL":"BaltimoreOriolespitching",
                    "BOS":"BostonRedSoxpitching",
                    "CHN":"ChicagoCubspitching",
                    "CHA":"ChicagoWhiteSoxpitching",
                    "CIN":"CincinnatiRedspitching",
                    "CLE":"ClevelandGuardianspitching",
                    "COL":"ColoradoRockiespitching",
                    "DET":"DetroitTigerspitching",
                    "KCA":"KansasCityRoyalspitching",
                    "HOU":"HoustonAstrospitching",
                    "ANA":"AnaheimAngelspitching",
                    "LAN":"LosAngelesDodgerspitching",
                    "MIA":"MiamiMarlinspitching",
                    "MIL":"MilwaukeeBrewerspitching",
                    "MIN":"MinnesotaTwinspitching",
                    "NYN":"NewYorkMetspitching",
                    "NYY":"NewYorkYankeespitching",
                    "OAK":"OaklandAthleticspitching",
                    "PHI":"PhiladelphiaPhilliespitching",
                    "PIT":"PittsburghPiratespitching",
                    "SDN":"SanDiegoPadrespitching",
                    "SEA":"SeattleMarinerspitching",
                    "SFN":"SanFranciscoGiantspitching",
                    "SLN":"StLouisCardinalspitching",
                    "TBA":"TampaBayRayspitching",
                    "TEX":"TexasRangerspitching",
                    "TOR":"TorontoBlueJayspitching",
                    "WAS":"WashingtonNationalspitching"}

def batting(team,soup):
    teamBatting = soup.find_all("table", {"id":"%s" % battingNames[team]})
    data_rows = teamBatting[0].findAll('tr')
    data_header = teamBatting[0].findAll('thead')
    data_header = data_header[0].findAll("tr")
    data_header = data_header[0].findAll("th")
    game_data = [[td.getText() for td in data_rows[i].findAll(['th','td'])]
        for i in range(len(data_rows))]
    data = pd.DataFrame(game_data)
    header = []
    for i in range(len(data.columns)):
        header.append(data_header[i].getText())
    data.columns = header
    data = data.loc[data[header[0]] != header[0]]
    data = data.reset_index(drop = True)
    data.drop(columns=['BA','OBP','SLG','OPS','Pit','Str','WPA','WPA+','WPA-','cWPA','aLI','acLI','RE24','PO','A'],inplace=True)
    data = data[data.PA != '']
    return data

def pitching(team,soup):
    teamPitching = soup.find_all("table", {"id":"%s" % pitchingNames[team]})
    data_rows = teamPitching[0].findAll('tr')
    data_header = teamPitching[0].findAll('thead')
    data_header = data_header[0].findAll("tr")
    data_header = data_header[0].findAll("th")
    game_data = [[td.getText() for td in data_rows[i].findAll(['th','td'])]
        for i in range(len(data_rows))]
    data = pd.DataFrame(game_data)
    header = []
    for i in range(len(data.columns)):
        header.append(data_header[i].getText())
    data.columns = header
    data = data.loc[data[header[0]] != header[0]]
    data = data.reset_index(drop = True)
    data.drop(columns=['Ctct','StS','StL','GB','FB','LD','Unk','GSc','IR','IS','WPA','aLI','cWPA','acLI','RE24'],inplace=True)
    return data


def output(hteam, ateam, gameInfo, homeBatting, awayBatting, homePitching, awayPitching):
    print()
    print('-------------------')
    print('    ' + hteam + ' vs ' + ateam)
    print('-------------------')
    print()
    for i in gameInfo:
        print(i)
    print()
    print('------------------------------------------------------------')
    print('                         ' + hteam + ' Batting')
    print('------------------------------------------------------------')
    print(homeBatting)
    print()
    print('------------------------------------------------------------')
    print('                         ' + ateam + ' Batting')
    print('------------------------------------------------------------')
    print(awayBatting)
    print()
    print('------------------------------------------------------------------------')
    print('                         ' + hteam + ' Pitching')
    print('------------------------------------------------------------------------')
    print(homePitching)
    print()
    print('------------------------------------------------------------------------')
    print('                         ' + ateam + ' Pitching')
    print('------------------------------------------------------------------------')
    print(awayPitching)
    print()

def main():
    # TODO make this more robust
    try:
        hteam = sys.argv[1]
        gameDate = sys.argv[2]
    except:
        usage()

    homeTeam=hteam
    if homeTeam in teams.keys():
        homeTeam = teams[homeTeam]

    # TODO account for doubleheaders
    url = 'https://www.baseball-reference.com/boxes/%s/%s%s0.shtml' % (homeTeam,homeTeam,gameDate)
    res = requests.get(url)
    comm = re.compile("<!--|-->")
    soup = BeautifulSoup(comm.sub("", res.text), 'html.parser')

    scorebox = soup.find(attrs = {'class' : 'scorebox'})
    teamLinks=scorebox.select("a[href*=teams]")

    ateam = (teamLinks[0]['href'].split('/')[2])
    awayTeam=ateam
    if awayTeam in teams.keys():
        awayTeam = teams[awayTeam]

    gameMetadata = soup.find(attrs = {'class' : 'scorebox_meta'})
    gameMetadataList = gameMetadata.find_all('div')
    gameDate = gameMetadataList[0].text
    startTime = gameMetadataList[1].text
    attendance = gameMetadataList[2].text
    stadium = gameMetadataList[3].text
    gameDur = gameMetadataList[4].text
    #startTime = divs[1].text.strip("Start Time: ").replace(' Local','')
    #attendance = int(divs[2].text.strip("Attendance: ").replace(',',''))
    #stadium = divs[3].text.strip("Venue: ")
    #gameDur = divs[4].text.strip("Game Duration: ")

    gameInfo = [gameDate, startTime, attendance, stadium, gameDur]
    homeBatting = batting(homeTeam, soup)
    awayBatting = batting(awayTeam, soup)
    homePitching = pitching(homeTeam, soup)
    awayPitching = pitching(awayTeam, soup)

    output(hteam, ateam, gameInfo, homeBatting, awayBatting, homePitching, awayPitching)

if __name__ == "__main__":
   main()
