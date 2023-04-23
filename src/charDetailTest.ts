function parseCharacter2(row: d3.DSVRowString<string>): KorraCharacterData {
    return {
        Name: row.name!,
        Url: row.url!,
        Image_Url: row.imageUrl
    }
}
/*
// d3.tsv('data/sampleData.tsv')
d3.json('data/episodes.json')
    .then((rawData) => {
        const data2 = rawData as KorraEpisode[];

        console.log(`Data loading complete: ${data.length} episodes.`);
        console.log("Example:", data2[0]);
        d3.csv('data/KorraCharacters.csv')
        .then((rawcharData) => {
            const charData2 = rawcharData.map(parseCharacter2)
            console.log(`Data loading complete: ${charData2.length} characters.`);
            console.log("Example:", charData2[0]);
            return visualizeData2(data2,charData2);
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
  }*/


function visualizeData2(data: KorraEpisode[], charData:KorraCharacterData[]) {
    console.log("visualizing",charData)
    
    const findCharacterData = (name: string) => {
        let foundChar = charData.find(d => d.Name.toLowerCase() === name); 
        if (foundChar == undefined) {
            //console.log("Trying again for",name);
            // Try secondary finding?
            foundChar = charData.find(d =>isMatch(d.Name.toLowerCase(),name));
            if (foundChar) {
                //console.log("Found second time",foundChar,name)
            } 
        }
        return foundChar 
    }

    
    
    const getCharacterTooltip = (name: string,label: any, value: any) =>{ // pass the label and value you want
        var lowerName = name.toLowerCase()
        var charData = findCharacterData(lowerName)
        var image = charData?.Image_Url // Might not exist
        var url = charData?.Url // Unused due to difficulty
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
                        <img src="${image}", width="80" height="65">
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
        data[20].transcript,
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

    const getCharactersInData = (data:KorraEpisode[]) =>{
        //console.log("Grabbing characters in selected episode set",data)
        let all_names = new Set<string>()
        let all_characters = new Array<KorraCharacterData>()
        for (const episode of data) {
            episode.transcript.forEach(line => {
                if (line.speaker.includes("May")){
                    console.log("line speaker change",line)
                }
                all_names.add(line.speaker);

                
            })
        }
        for (const name of all_names){
            let characterData = findCharacterData(name);
            let exists = all_characters.find(d => d.Name === characterData?.Name);  // removes dupes
            if (characterData  != undefined && !exists) {
                all_characters.push(characterData);
            }
        }
        return all_characters;
    }

    // Character table
    const updateCharTable = (data: KorraEpisode[]) => { // Pass in updated data here
        console.log("Updating character table")
        let table = '<table border="1">';
        let charactersInData = getCharactersInData(data); // returns all characters found in selected data transcript
        console.log("got character data",charactersInData)
        table += `<tr><th></th><th>Name</th><th>Details</th></tr>`;
        charactersInData.forEach((character, index) => {
            table = table + `<tr>`;
            table = table + `<td> <img src="${character.Image_Url}", width="45" height="40"></td>`;
            table = table + `<td>${character.Name}</td>`;
            table = table + `<td><a href='${character.Url}'> Details</a></td>`;
            table += `</tr>`;
         });
         table += "</table>";
         let tablePlace = document.getElementById("characterTable")
         if (tablePlace) {
            tablePlace.innerHTML = table;
         }
     }
     
    updateCharTable(data); // Pas in character
    d3.select("#loader").remove();
}
