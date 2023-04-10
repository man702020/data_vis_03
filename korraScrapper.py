# This code uses links to scrape the korra fan wiki to find seasons then episodes then transcripts for each episode
# Process: Manually input the link to the four seasons
# Scroll through and pull each episode name/number/link, store in dictionary of seasons (or dataframe)
# while finding episde link, navigate to and find transcript link (non comentary)
# finish first scrape
# Iterate again through every episode via season>episode>transcriptLink
# Each episode is nicely organized in rows
# characters are bolded in separate column
# actions have no text in first column
# dialogue has character in first column (character specific actions are given within "[]", )
# Each episode will have the following format:
#
# ID (int): id for unique identification 
# Season_Number (int): season number
# Episode_Number (int): episode number
# Episode_Name (varchar): episode name
# Transcript_Step (varchar): episode specific id counting order action/dialogue occures
# Script_Type (varchar): "Dialogue" or "Action" (Can convert to int?)
# Character (varchar): Name of character
# Dialogue (varchar): Dialogue from character or action taken
# Link (varchar): Link to transcript
# ??Scene # (varchar): Potential scene numbers infered by the actions taken between dialogue 

#NOTE: You can ignore this above process since the other script was already created (leaving in just in case)
FOUR_SEASON_LINKS = [{'season':1, 'url':"https://avatar.fandom.com/wiki/Book_One:_Air"}, {'season':2,'url':"https://avatar.fandom.com/wiki/Book_Two:_Spirits"},
                     {'season':3,'url':"https://avatar.fandom.com/wiki/Book_Three:_Change"},{'season':4,'url':"https://avatar.fandom.com/wiki/Book_Four:_Balance"}
                    ]

from bs4 import BeautifulSoup
#from tinydb import TinyDB, Query
import urllib3
import pandas as pd
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

#Helper functions
def getPage(url):
    http = urllib3.PoolManager()
    r = http.request("GET", url)
    return BeautifulSoup(r.data,'lxml')

def cleanText(text): #cleans up newlines and whitespaces in a text
    return text.replace('\n','').replace('\r','').strip()

# Creates an object describing every episode
# Returns:
# {
#  season: (int) number of season episode is in (1-4)
#  episode: (int) number of episode in season
#  title:   (string) title of episode
#  url:     (string) direct url to transcript of episode
# }
def generateEpisodeUrls(season,page): #parses main index and returns cas/linkTouple list
    linkHeader = "https://avatar.fandom.com/"
    print("\n Generating episodes for season",season)
    table = page.find_all("table") [1] # sholuld be the second table
    if season == 4: # do different search for 4th season due to html difference
          table = page.find_all("table") [0] # sholuld be the second table
    tbody = table.find("tbody")
    rows = tbody.find_all("tr",recursive=False) # each tr at this level is an episode
   
    season_episodes = []
    for num,episode in enumerate(rows): #iterate over every row and get data
        dataRows = episode.find_all("td") #  
        episodeURL = linkHeader + dataRows[1].find('a').get('href') # direct url (need debug for empty data)
        title = dataRows[1].find('a').get('title')
        episodePage = getPage(episodeURL)
        transcriptUrl = getTranscriptUrl(episodePage)
        if transcriptUrl:
            transcriptUrl = linkHeader + transcriptUrl

        episodeData = {'season':season,'episode':num, 'title':title, 'url': transcriptUrl}
        season_episodes.append(episodeData)
        print("Found and generated",title,transcriptUrl)
        #if num >=1:
        #    break
        #TODO: possibly put delay to prevent spammy blocks
    
    return season_episodes

def getTranscriptUrl(page):
    dl_tags = page.find_all("dl")
    for dl in dl_tags: #I understand there is a more efficient way to do this but this might catch more edge cases
        links = dl.find_all('a')
        if len(links) > 0:
            for link in links:
                title = link.get('title') # dont need findall but whutever
                if title.startswith("Transcript") and not title.endswith("(commentary)"):
                    url = link.get("href")
                    #print("found transcriptLink",title,url)
                    return url

# Generates a list of dictionaries of every episode in every season
#Format:[
#{
#  season: (int) number of season episode is in (1-4)
#  episode: (int) number of episode in season
#  title:   (string) title of episode
#  url:     (string) direct url to transcript of episode
# }]
def scrape_Seasons():
    totalEpisodes = 0
    all_episodes = []
    for season in FOUR_SEASON_LINKS:
        print("Grabbing",season['url'])
        page = getPage(season['url'])
        episodeData = generateEpisodeUrls(season['season'],page) # generates episode data for all episodes in season
        all_episodes += episodeData # should work?
    
    totalEpisodes = len(all_episodes)
    print("found",totalEpisodes,all_episodes) 
    return all_episodes

def exportData(data):
    episodeDF = pd.DataFrame(data)
    episodeDF.to_csv("./KorraEpisodes.csv")


## output: list
def Main():
    print("Starting")
    results = scrape_Seasons()
    print("Finished Gathering Data:",len(results),"episodes")
    exportData(results)

Main()
