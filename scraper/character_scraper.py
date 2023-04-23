import os
import urllib3

from bs4 import BeautifulSoup
import pandas as pd

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# this code scrapes all of the characters

character_link = "https://avatar.fandom.com/wiki/Category:Legend_of_Korra_characters"



# Helper functions
def getPage(url):
    http = urllib3.PoolManager()
    r = http.request("GET", url)
    return BeautifulSoup(r.data, "html.parser")

def cleanText(text): # cleans up newlines and whitespaces in a text
    return text.replace('\n', '').replace('\r', '').strip()



def getAllCharaterUrls(page): #Grabs ALL characters
    linkHeader = "https://avatar.fandom.com/"
    all_characters = []
    print("\n getting characteers")
    
    chars =page.find_all("a",{'class':"category-page__member-link"})
    print("Chars \n",chars[0])
    for char in chars:
        name = char.get('title')
        if name.startswith("Category:"): #skip these
            print("skipping category")
            continue
            
        link = char.get('href')
        print("\nName:",name,"\nLink:",link)
        characterUrl = linkHeader + link
        characterPage = getPage(characterUrl)
        imageLink = getImageLink(characterPage)
        if imageLink:
            sliceLoc = imageLink.find(".png")
            imageLink = imageLink[0:sliceLoc+4]
        else:
            print(f"ERROR: Could not find image url for character: '{name}'")

        characterData = {
            'name': name,
            'url': characterUrl,
            'imageUrl': imageLink,
        }
        all_characters.append(characterData)
        

    return all_characters
def getCharacterUrls(page): # DEPRECIATED: Only Grabs main ish characters
    linkHeader = "https://avatar.fandom.com/"
    all_characters = []
    print("\n getting characteers")
    mainCharElement = page.find("span",{"id":"Main_characters"})
    chars = mainCharElement.find_all_next("li") # sholuld be the second table
    #print("\n",chars[0])
    for char in chars:
        nameLink  = char.find("b").find('a')
        name = nameLink.get('title')

        if name == "President": #strange case, the character is actually the second url
            nameLink  = char.find("b").find_all('a')[1] #second link is real character
            name = name = nameLink.get('title')
            

        link = nameLink.get('href')

        print("\nName:",name,"\nLink:",link)
        characterUrl = linkHeader + link
        characterPage = getPage(characterUrl)
        imageLink = getImageLink(characterPage)
        if imageLink: #clean imagelink
            sliceLoc = imageLink.find(".png")
            print("foundslice",sliceLoc)
            imageLink = imageLink[0:sliceLoc]
            print("postslice",imageLink)
        
        else:
            print(f"ERROR: Could not find image url for character: '{name}'")

        characterData = {
            'name': name,
            'url': characterUrl,
            'imageUrl': imageLink,
        }
        all_characters.append(characterData)
        if name == "Toph Beifong":
            break

    return all_characters

def getImageLink(page: BeautifulSoup):
    url = None
    image = page.find("img",{'class':"pi-image-thumbnail"})
    if image:
        url = image.get('src') # dont need findall but whutever
    print("url",url)
    return url

def scrape_characters():
    totalCharacters = 0
    all_Characters = []
    page = getPage(character_link)
    all_Characters = getAllCharaterUrls(page) # generates episode data for all episodes in season
    print("found", all_Characters,len(all_Characters))
    return all_Characters

def exportData(data):
    project_folder = os.path.dirname(os.path.dirname(__file__))
    output_path = os.path.join(project_folder, "data", "KorraCharacters.csv")

    episodeDF = pd.DataFrame(data)
    episodeDF.to_csv(output_path, index=False)


## output: list
def main():
    print("Starting")
    results = scrape_characters()
    print("Finished Gathering Data:", len(results), "Characters")
    exportData(results)

if __name__ == "__main__":
    main()
