function parseCharacter(row: d3.DSVRowString<string>): KorraCharacterData {
    return {
        Name: row.name!,
        Url: row.url!,
        Image_Url: row.imageUrl
    }
}

// d3.tsv('data/sampleData.tsv')
d3.json('data/episodes.json')
    .then((rawData) => {
        const data = rawData as KorraEpisode[];

        console.log(`Data loading complete: ${data.length} episodes.`);
        console.log("Example:", data[0]);
        d3.csv('data/KorraCharacters.csv')
        .then((rawcharData) => {
            const charData = rawcharData.map(parseCharacter)
            console.log(`Data loading complete: ${charData.length} characters.`);
            console.log("Example:", charData[0]);
            return visualizeData2(data,charData);
        }).catch(err => {
            console.error("Error loading Character data");
            console.error(err);
        });
    })
    .catch(err => {
        console.error("Error loading Episode data");
        console.error(err);
    });
// Testing on tooltip details for kora

function isMatch(searchOnString: string, searchText: string) { // searches for a whole word within a tring of words
    searchText = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return searchOnString.match(new RegExp("\\b"+searchText+"\\b", "i")) != null;
  }


function visualizeData2(data: KorraEpisode[], charData:KorraCharacterData[]) {
    console.log("visualizing",charData)
    
    const findCharacterData = (name: string) => {
        let foundChar = charData.find(d => d.Name.toLowerCase() === name); 
        if (foundChar == undefined) {
            //console.log("Trying again for",name);
            // Try secondary finding?
            foundChar = charData.find(d =>isMatch(d.Name.toLowerCase(),name));
            if (foundChar) {
                console.log("Found second time",foundChar,name)
            } 
        }
        return foundChar 
    }
    
    const getCharacterTooltip = (name: string,label: any, value: any) =>{ // pass the label and value you want
        var lowerName = name.toLowerCase()
        var charData = findCharacterData(lowerName)
        var image = charData?.Image_Url // Might not exist
        var url = charData?.Url
        var output = ` 
                        <div class='charBox'><b>${name}</b> </div>
                        <br>
                        <ul>
                        <li><b>${label}:</b> ${value}</li>
                        </ul>
                    `
        if (charData != undefined){
            output = ` 
                        <div class='charBox'>
                        <img src="${image}" 1x, width="80" height="60">
                        <br>
                        <b>${name}</b>
                        </div>
                        <ul>
                        <li><b>${label}:</b> ${value}</li>
                        </ul>

        `
        }

        return output
    }
    const all_characters = new BarChart(
        data[0].transcript,
        aggregateMapper(
            (d) => d.speaker,
            (b, c) => ({ label: b, value: c, 
                tooltip: getCharacterTooltip(b,"Episodes",c) // Character name, tooltip value label, Value
            })
        ),
        {
            xAxisLabel: "Season",
            yAxisLabel: "Episodes",
            colorScheme: d3.schemeCategory10
        },
        {
            parent: "#chart-container",
            className: "col-12",
            height: 200,
            width: 500,
            margin: { top: 50, right: 50, bottom: 50, left: 80 }
        }
    )

    d3.select("#loader").remove();
}
