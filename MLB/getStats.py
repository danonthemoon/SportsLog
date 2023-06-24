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

def main():
    hteam = sys.argv[1]
    gameDate = sys.argv[2]
    homeTeam=hteam
    if homeTeam in teams.keys():
        homeTeam = teams[homeTeam]

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

    print()
    print('    ' + hteam + ' vs ' + ateam)
    print('------------------------')

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
    for i in gameInfo:
        print(i)

    print()
    print('------------------------------------------------------------')
    print('                         ' + hteam + ' Batting')
    print('------------------------------------------------------------')
    homeBatting = soup.find_all("table", {"id":"%s" % battingNames[homeTeam]})
    data_rows = homeBatting[0].findAll('tr')
    data_header = homeBatting[0].findAll('thead')
    data_header = data_header[0].findAll("tr")
    data_header = data_header[0].findAll("th")
    game_data = [[td.getText() for td in data_rows[i].findAll(['th','td'])]
        for i in range(len(data_rows))
        ]
    data = pd.DataFrame(game_data)
    header = []
    for i in range(len(data.columns)):
        header.append(data_header[i].getText())
    data.columns = header
    data = data.loc[data[header[0]] != header[0]]
    data = data.reset_index(drop = True)
    data.drop(columns=['BA','OBP','SLG','OPS','Pit','Str','WPA','WPA+','WPA-','cWPA','aLI','acLI','RE24','PO','A'],inplace=True)
    data = data[data.PA != '']
    print(data)


    print()
    print('------------------------------------------------------------')
    print('                         ' + ateam + ' Batting')
    print('------------------------------------------------------------')
    awayBatting = soup.find_all("table", {"id":"%s" % battingNames[awayTeam]})
    data_rows = awayBatting[0].findAll('tr')
    data_header = awayBatting[0].findAll('thead')
    data_header = data_header[0].findAll("tr")
    data_header = data_header[0].findAll("th")
    game_data = [[td.getText() for td in data_rows[i].findAll(['th','td'])]
        for i in range(len(data_rows))
        ]
    data = pd.DataFrame(game_data)
    header = []
    for i in range(len(data.columns)):
        header.append(data_header[i].getText())
    data.columns = header
    data = data.loc[data[header[0]] != header[0]]
    data = data.reset_index(drop = True)
    data.drop(columns=['BA','OBP','SLG','OPS','Pit','Str','WPA','WPA+','WPA-','cWPA','aLI','acLI','RE24','PO','A'],inplace=True)
    data = data[data.PA != '']
    print(data)


    print()
    print('------------------------------------------------------------------------')
    print('                         ' + hteam + ' Pitching')
    print('------------------------------------------------------------------------')
    homePitching = soup.find_all("table", {"id":"%s" % pitchingNames[homeTeam]})
    data_rows = homePitching[0].findAll('tr')
    data_header = homePitching[0].findAll('thead')
    data_header = data_header[0].findAll("tr")
    data_header = data_header[0].findAll("th")
    game_data = [[td.getText() for td in data_rows[i].findAll(['th','td'])]
        for i in range(len(data_rows))
        ]
    data = pd.DataFrame(game_data)
    header = []
    for i in range(len(data.columns)):
        header.append(data_header[i].getText())
    data.columns = header
    data = data.loc[data[header[0]] != header[0]]
    data = data.reset_index(drop = True)
    data.drop(columns=['Ctct','StS','StL','GB','FB','LD','Unk','GSc','IR','IS','WPA','aLI','cWPA','acLI','RE24'],inplace=True)
    print(data)


    print()
    print('------------------------------------------------------------------------')
    print('                         ' + ateam + ' Pitching')
    print('------------------------------------------------------------------------')
    awayPitching = soup.find_all("table", {"id":"%s" % pitchingNames[awayTeam]})
    data_rows = awayPitching[0].findAll('tr')
    data_header = awayPitching[0].findAll('thead')
    data_header = data_header[0].findAll("tr")
    data_header = data_header[0].findAll("th")
    game_data = [[td.getText() for td in data_rows[i].findAll(['th','td'])]
        for i in range(len(data_rows))
        ]
    data = pd.DataFrame(game_data)
    header = []
    for i in range(len(data.columns)):
        header.append(data_header[i].getText())
    data.columns = header
    data = data.loc[data[header[0]] != header[0]]
    data = data.reset_index(drop = True)
    data.drop(columns=['Ctct','StS','StL','GB','FB','LD','Unk','GSc','IR','IS','WPA','aLI','cWPA','acLI','RE24'],inplace=True)
    print(data)

    print()

if __name__ == "__main__":
   main()
