import json
import re
import os




PROJECT_FOLDER = os.path.dirname(os.path.dirname(__file__))

COMMON_WORDS = "very,we're,ooh,or,with,all,on,don't,like,she,so,just,can,get,for,the,you,to,i'm,i've,and,a,me,of,in,it,it's,that's,too,is,you're,your,this,i,we,me,us,our,ours,ourselves,myself,you,yours,yours,my,he,him,her,it,they, hem,himself,herself,themselves,their,who,whom,what,which,where,this,that,those,is,am,are,was,were,has,have,had been,be,were,had,have,this,those,did,do,does,will,could,would,let's,if,but,and,a,an,the,if,because,as,while,until,about,into,through,before,after,during,in,out,here,there,when,some,no,not,only,say,says,said,shall,own".split(",")



def main():
    input_path = os.path.join(PROJECT_FOLDER, "data", "episodes.json")

    data = None
    with open(input_path, "r") as input_file:
        data = json.load(input_file)

    seasons = {
        1: {
            "season": 1,
            "episodes": 0,
        },
        2: {
            "season": 2,
            "episodes": 0,
        },
        3: {
            "season": 3,
            "episodes": 0,
        },
        4: {
            "season": 4,
            "episodes": 0,
        }
    }

    for episode in data:
        sno = episode["season"]
        seasons[sno]["episodes"] += 1

        word_set = {}
        for line in episode["transcript"]:
            words = re.split(r"[;:!?,\s\/\.“\"\-—()[\]{}]+", line["text"].lower())
            for w in words:
                if len(w) == 0 or w in COMMON_WORDS: continue
                if w in word_set:
                    word_set[w] += 1
                else:
                    word_set[w] = 1
        episode["words"] = word_set

    new_data = {
        "episodes": data,
        "seasons": list(seasons.values())
    }

    output_path = os.path.join(PROJECT_FOLDER, "data", "data.json")
    with open(output_path, "w") as output_file:
        json.dump(new_data, output_file)

if __name__ == "__main__":
    main()
