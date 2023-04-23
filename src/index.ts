function parseCharacter(row: d3.DSVRowString<string>): KorraCharacterData {
    return {
        Name: row.name!,
        Url: row.url!,
        Image_Url: row.imageUrl
    }
}
// helpers
function isMatch(searchOnString: string, searchText: string) { // searches for a whole word within a tring of words
    searchText = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return searchOnString.match(new RegExp("\\b"+searchText+"\\b", "i")) != null;
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
            console.log(`Character loading complete: ${charData.length} characters.`);
            console.log("Chatacter example:", charData[0]);
            return visualizeData(data,charData);
        }).catch(err => {
            console.error("Error loading Character data");
            console.error(err);
        });
    })
    .catch(err => {
        console.error("Error loading Episode data");
        console.error(err);
    });



type FilterFn = (d: KorraEpisode) => boolean | undefined | 0;


const SEASON_COLORS = [
    "#e41a1c", "#377eb8", "#4daf4a", "#984ea3"
];
const EPISODE_COLOR_MAP = [
    ...new Array(12).fill(SEASON_COLORS[0]),
    ...new Array(14).fill(SEASON_COLORS[1]),
    ...new Array(13).fill(SEASON_COLORS[2]),
    ...new Array(13).fill(SEASON_COLORS[3]),
];

const CHARACTER_COLOR_MAP: Record<string, string> = {
    "Korra":    "#8dd3c7",
    "Lin":      "#ffffb3",
    "Tarrlok":  "#bebada",
    "Toph":     "#fb8072",
    "Tenzin":   "#80b1d3",
    "Jinora":   "#fdb462",
    "Iroh":     "#b3de69",
    "Mako":     "#fccde5",
    "Bolin":    "#d9d9d9",
    "Asami":    "#bc80bd",
    "Suyin":    "#ccebc5",
    "Kuvira":   "#ffed6f",
};
const IMPORTANT_CHARACTERS = Object.keys(CHARACTER_COLOR_MAP);



function visualizeData(data: KorraEpisode[],charData:KorraCharacterData[]) {
    // const filters: Record<string, FilterFn> = {};

    const visualizations: AbstractVisualization<KorraEpisode, unknown, VisualizationConfig<any>>[] = [];

    // const addFilter = (key: string, filterFn: FilterFn) => {
    //     filters[key] = filterFn;
    //     rerenderData()
    // }
    // const removeFilter = (key: string) => {
    //     delete filters[key];
    //     rerenderData()
    // }
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
                        </div>
                        <b>${name}</b>
                        <br>
                        <b>${label}:</b> ${value}
                        `
        }

        return output
    }
    const getCharactersInData = (data:KorraEpisode[]) =>{
        //console.log("Grabbing characters in selected episode set",data)
        let all_names = new Set<string>();
        let all_characters = new Array<KorraCharacterData>();
        for (const episode of data) {
            episode.transcript.forEach(line => {
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
    let charactersInData = getCharactersInData(data); // UPDATE THIS WITH NEW DATA SELECTION
    

    const characterEventHandler = new CharacterEventHandler();
    characterEventHandler.addEventHandler((ev, ch) => {
        //console.log(ev, ch);
        let eventChar = findCharacterData(ch);
        switch(ev) {
            case "hover":
                if (eventChar){
                    charactersInData = charSortCharacterTable(charactersInData,eventChar);
                    updateCharTable(charactersInData);
                    boldCharTable(eventChar,true);
                }
                break;
            case "unhover":
                if (eventChar) { // unbold
                    boldCharTable(eventChar,false);
                }
                break;
        }
    });
    const filterData = (newData: KorraEpisode[]) => {
        visualizations.forEach((v) => {
            v.setData(newData);
            v.render();
        });
    }

    const characterEventHandler = new CharacterEventHandler();
    characterEventHandler.addEventHandler((ev, ch) => {
        console.log(ev, ch);
    });


    d3.select("#btn-reset-s1").on("click", () => filterData(data.filter((d) => d.season === 1)));
    d3.select("#btn-reset-s2").on("click", () => filterData(data.filter((d) => d.season === 2)));
    d3.select("#btn-reset-s3").on("click", () => filterData(data.filter((d) => d.season === 3)));
    d3.select("#btn-reset-s4").on("click", () => filterData(data.filter((d) => d.season === 4)));
    d3.select("#btn-reset-season").on("click", () => filterData(data));

   // characterEventHandler.
    const charSortCharacterTable = (data:KorraCharacterData[], character:KorraCharacterData)  => { // Resorts character data to put it on top of list
        let all_characters = new Array<KorraCharacterData>()
        all_characters.push(character) // prefills selected character to top of array
        for (const characterData of data){
            let exists = all_characters.find(d => d.Name === characterData?.Name);  // removes dupes and pushes rest of data
            if (characterData  != undefined && !exists) {
                all_characters.push(characterData);
            } else{
                //console.log("already there",characterData.Name)
            }
        }
        return all_characters;
    }

    const boldCharTable = (char:KorraCharacterData,bold:boolean) => {
        let name = char.Name;
        let tableSelect = Array.from(document.getElementsByClassName(`tbl-${name}`) as HTMLCollectionOf<HTMLElement>);
        for (let i = 0; i < tableSelect.length; i++) {
            let element = tableSelect[i];
            if (bold) {
                element.style.fontWeight="bold";
            } else{
                element.style.fontWeight="normal";
            }  
        };
    }

    const updateCharTable = (charData: KorraCharacterData[]) => { // Pass in updated data here
        const  num_colums = 4 // number of columns in the row
        let table = '<table>';
         // returns all characters found in selected data transcript
        table += `<tr><th>Characters</th>`;
        for (let charIndex = 0; charIndex < charData.length; charIndex +=num_colums) {
            table = table + `<tr>`;
            for (let char_section = 0; char_section < num_colums; char_section ++) {
                //console.log(char_section,charIndex + char_section);
                let character = charData[charIndex + char_section];
                if (character) {
                    table = table + `<td class= 'tbl-${character.Name}'> <img src="${character.Image_Url}", width="45" height="40"></td>`;
                    table = table + `<td class='tbl-${character.Name}' >${character.Name}</td>`;
                    table = table + `<td class='tbl-${character.Name}' ><a href='${character.Url}'> Details</a></td>  `;
                } else{
                    //console.log("Could not find character",charIndex,char_section)
                }
            }
            table += `</tr>`;
        };
        table += "</table>";
        let tablePlace = document.getElementById("characterTable");
        if (tablePlace) {
            tablePlace.innerHTML = table;
        }
    }
    updateCharTable(charactersInData); // Pass in episodes


    const episodesPerSeason = new BarChart(
        data,
        aggregateMapper(
            (d) => d.season.toString(),
            (b, c) => ({ label: b, value: c, tooltip: `${c} Episodes`, color: SEASON_COLORS[parseInt(b) - 1] })
        ),
        {
            xAxisLabel: "Season",
            yAxisLabel: "Episodes",
        },
        {
            parent: "#chart-container",
            className: "col-12",
            height: 200,
            width: 500,
            margin: { top: 50, right: 50, bottom: 50, left: 80 }
        }
    );



    const linesPerCharacter = new BarChart(
        topTenCharacterLines,
        elementMapper(
            ([ speaker, lines]) => ({ label: speaker, value: lines, color: characterColors[speaker],tooltip: getCharacterTooltip(speaker,"Lines",lines) })
        data,
        accumulateMapper(
            (acc, ep) => {
                for(const line of ep.transcript) {
                    if(!IMPORTANT_CHARACTERS.includes(line.speaker)) { continue; }
                    if(line.speaker in acc) {
                        acc[line.speaker]++;
                    } else {
                        acc[line.speaker] = 1;
                    }
                }
                return acc;
            },
            {  } as Record<string, number>,
            (characterLines) => {
                return {
                    data: Object.entries(characterLines).sort((a, b) => b[1] - a[1]).map(([ speaker, lines]) => ({
                        label: speaker, value: lines, color: CHARACTER_COLOR_MAP[speaker]
                    })),
                    unknownCount: 0
                }
            }
        ),
        {
            xAxisLabel: "Character",
            yAxisLabel: "Lines",
            sort: (a, b) => b.value - a.value,
            eventHandler: characterEventHandler
        },
        {
            parent: "#chart-container",
            className: "col-12",
            height: 200,
            width: 500,
            margin: { top: 50, right: 50, bottom: 50, left: 100 }
        }
    );
    visualizations.push(linesPerCharacter);

    const linesPerEpisode = new MultiLineChart(
        data,
        accumulateMapper(
            (acc, ep) => {
                const epLines = {} as Record<string, number>;
                for(const line of ep.transcript) {
                    if(!IMPORTANT_CHARACTERS.includes(line.speaker)) { continue; }
                    if(line.speaker in epLines) {
                        epLines[line.speaker]++;
                    } else {
                        epLines[line.speaker] = 1;
                    }
                }

                for(const speaker in epLines) {
                    if(speaker in acc) {
                        acc[speaker].values.push({ x: ep.abs_episode, y: epLines[speaker] });
                    } else {
                        acc[speaker] = {
                            label: speaker,
                            color: CHARACTER_COLOR_MAP[speaker],
                            values: [
                                { x: ep.abs_episode, y: epLines[speaker] }
                            ],
                        }
                    }
                }
                return acc;
            },
            {} as Record<string, Series>,
            (data) => ({ data: Object.values(data), unknownCount: 0 })
        ),
        {
            title: "Character Lines per Episode",
            xAxisLabel: "Episode",
            yAxisLabel: "Lines",
            eventHandler: characterEventHandler,
            tooltipFn: (d) => getCharacterTooltip(d.series.label,`Lines in Episode ${d.x}`,d.y)
        },
        {
            parent: "#big-chart-container",
            className: "col-12",
            height: 400,
            width: 1000,
            margin: { top: 50, right: 100, bottom: 50, left: 90 }
        }
    )
    visualizations.push(episodesPerSeason);



    const timelineHist = new BarChart(
        data,
        elementMapper(
            (d) => {
                const label = d.abs_episode.toString();
                const value = d.transcript.length;
                return {
                    label,
                    value,
                    tooltip: `${value} Lines`, color: EPISODE_COLOR_MAP[d.abs_episode - 1]
                };
            }
        ),
    {
        xAxisLabel: "Total number of Episode",
        yAxisLabel: "Number of Lines",
        labelSort: (a,b) =>parseInt(a)-parseInt(b),
        //colorScheme: scheme3
    }, {
            parent: "#big-chart-container",
            width: 1000,
            height: 150,
            margin: { top: 50, left: 100, bottom: 50, right: 50 }
        }
    );

    const wordCloud = new WordMap(
        data,
        accumulateMapper(
            (acc, ep) => {
                for(const line of ep.transcript) {
                    for(const word of line.text.toLowerCase().split(/[;:!?,\s\/\.“"\-—()[\]{}]+/)) {
                        if(!word || COMMON_WORDS.has(word)) { continue; }
                        if(word in acc) {
                            acc[word]++;
                        } else {
                            acc[word] = 1;
                        }
                    }
                }
                return acc;
            },
            {} as Record<string, number>,
            (obj) => ({
                data: Object.entries(obj).map(([text, value]) => ({ text, value })),
                unknownCount: 0
            })
        ),
        {},
        {
            parent: '#big-chart-container',
            height: 400,
            width: 800
        }
    );
    visualizations.push(wordCloud);



    d3.select("#loader").remove();
}
