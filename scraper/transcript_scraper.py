import json
import re
import requests
import os

import bs4
import pandas as pd



PROJECT_FOLDER = os.path.dirname(os.path.dirname(__file__))
TEST_EPISODE_URL = "https://avatar.fandom.com/wiki/Transcript:A_Breath_of_Fresh_Air"


def get_text_content(node):
    if(isinstance(node, bs4.NavigableString)):
        return str(node).strip()
    # Join with a single space in case there are inline text elements that need separated.
    joined_string = " ".join([ get_text_content(child) for child in node.contents ])
    # Return multiple spaces replaced by a single space, in case we inserted too many.
    return re.sub(r"[\s]+", " ", joined_string)

def get_dialog_content(node):
    text = get_text_content(node)
    return re.sub(r"\[[^\]]*\]", "", text).strip()

def get_episode_transcript(url: str):
    res = requests.get(url)
    S = bs4.BeautifulSoup(res.content, "html.parser")

    lines = [
        {
            "speaker": get_text_content(row.find("th")),
            "text": get_dialog_content(row.find("td"))
        } for row in S.css.select("table.wikitable tr:has(th)")
    ]

    return lines



def main():
    episode_objs = []

    edpisode_path = os.path.join(PROJECT_FOLDER, "data", "KorraEpisodes.csv")
    episodes = pd.read_csv(edpisode_path)
    for idx, ep in episodes.iterrows():
        print(f"Fetching for '{ep['url']}'")
        transcript = get_episode_transcript(ep["url"])
        episode_objs.append({
            "abs_episode": idx + 1,
            "season": ep["season"],
            "episode": ep["episode"],
            "title": ep["title"],
            "transcript_url": ep["url"],
            "transcript": transcript
        })

    output_path = os.path.join(PROJECT_FOLDER, "data", "episodes.json")
    with open(output_path, "w") as output_file:
        json.dump(episode_objs, output_file)

if __name__ == "__main__":
    main()
