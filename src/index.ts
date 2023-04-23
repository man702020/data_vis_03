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


Promise.all([
    d3.json('data/data.json'),
    d3.csv('data/KorraCharacters.csv')
])
    .then(([epData, charData]) => {
        const data = epData as LoadedData;
        console.log(`Data loading complete: ${data.episodes.length} episodes.`);
        console.log("Example:", data.episodes[0]);

        return visualizeData(data.episodes, charData.map(parseCharacter));
    })
    .catch(err => {
        console.error("Error loading the data");
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
    "Korra":    d3.schemeCategory10[0],
    "Lin":      d3.schemeCategory10[1],
    "Tarrlok":  d3.schemeCategory10[2],
    "Toph":     d3.schemeCategory10[3],
    "Tenzin":   d3.schemeCategory10[4],
    "Jinora":   d3.schemeCategory10[5],
    "Iroh":     d3.schemeCategory10[6],
    "Mako":     d3.schemeCategory10[7],
    "Bolin":    d3.schemeCategory10[8],
    "Asami":    d3.schemeCategory10[9],
    "Suyin":    d3.schemePaired[9],
    "Kuvira":   d3.schemeSet1[6],
};
const IMPORTANT_CHARACTERS = Object.keys(CHARACTER_COLOR_MAP);

const filterBtnIds = [
    "#btn-filter-s1",
    "#btn-filter-s2",
    "#btn-filter-s3",
    "#btn-filter-s4",
];



function visualizeData(data: KorraEpisode[],charData:KorraCharacterData[]) {
    const visualizations: AbstractVisualization<KorraEpisode, unknown, VisualizationConfig<any>>[] = [];


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


    function clearFilters() {
        visualizations.forEach((v) => {
            charactersInData = getCharactersInData(data);
            v.setData(data);
            v.render();
            updateCharTable(charactersInData);
        });
    }
    const filterSeasonData = (season: number) => {
        visualizations.forEach((v) => {
            let filteredData = data.filter((d) => d.season === season);
            v.setData(filteredData);
            charactersInData = getCharactersInData(filteredData); // separates the filter process and manually sends new data to table.
            updateCharTable(charactersInData);
            v.render();
        });
    }

    let activeSeasonFilter = 0;
    function setSeasonFilter(s: number) {
        if(s === activeSeasonFilter) { return; }
        activeSeasonFilter = s;

        if(s === 0) {
            clearFilters();
            d3.select("#btn-filter-none")
                .attr("class", "btn btn-secondary");
            d3.selectAll(filterBtnIds.join(","))
                .attr("class", "btn btn-outline-primary");
        } else {
            filterSeasonData(s);
            d3.select("#btn-filter-none")
                .attr("class", "btn btn-outline-secondary");
            d3.selectAll(filterBtnIds.join(","))
                .attr("class", "btn btn-outline-primary");
            d3.select(`#btn-filter-s${s}`)
                .attr("class", "btn btn-primary");
        }
    }

    d3.select("#btn-filter-none").on("click", () => setSeasonFilter(0));
    filterBtnIds.forEach((id, idx) => {
        d3.select(id).on("click", () => setSeasonFilter(idx + 1));
    })

    // Table updating
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
        table += `<tr><th>Characters: ${charData.length}</th>`;
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

    /** Used to dispatch character hover events to all visualizations */
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



    const episodesPerSeason = new BarChart(
        data,
        aggregateMapper(
            (d) => d.season.toString(),
            (b, c) => ({ label: b, value: c, tooltip: `${c} Episodes`, color: SEASON_COLORS[parseInt(b) - 1] })
        ),
        {
            xAxisLabel: "Season",
            yAxisLabel: "Episodes",
            onDataSelect: (d) => setSeasonFilter(parseInt(d.label)),
            title: "Number of Episodes per Season"
        },
        {
            parent: "#left-chart-container",
            className: "col-6",
            height: 150,
            width: 300,
            margin: { top: 50, right: 10, bottom: 50, left: 60 }
        }
    );
    visualizations.push(episodesPerSeason);



    const linesPerCharacter = new BarChart(
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

            () => ({  }) as Record<string, number>,
            (characterLines) => {
                return {
                    data: Object.entries(characterLines).sort((a, b) => b[1] - a[1]).map(([ speaker, lines]) => ({
                        label: speaker, value: lines, color: CHARACTER_COLOR_MAP[speaker],tooltip:getCharacterTooltip(speaker,`Total Lines`,lines)
                    })),
                    unknownCount: 0
                }
            }
        ),
        {
            xAxisLabel: "Character",
            yAxisLabel: "Lines",
            sort: (a, b) => b.value - a.value,
            eventHandler: characterEventHandler,
            padding: 0.2,
            xTickRotate: -45,
            title: "Number of line per main character"
        },
        {
            parent: "#left-chart-container",
            className: "col-6",
            height: 150,
            width: 300,
            margin: { top: 50, right: 10, bottom: 60, left: 70 }
        }
    );
    visualizations.push(linesPerCharacter);



    const timelineHist = new BarChart(
        data,
        elementMapper(
            (d) => {
                const label = d.abs_episode.toString();
                const value = d.transcript.length;
                return {
                    label,
                    value,
                    tooltip: `s${padNumber(d.season, 2)}e${padNumber(d.episode, 2)} Lines: ${value}`,
                    color: EPISODE_COLOR_MAP[d.abs_episode - 1],
                };
            }
        ),
    {
        xAxisLabel: "Total number of Episode",
        yAxisLabel: "Number of Lines",
        title: "Total Number of Line throughout the season",
        labelSort: (a,b) => parseInt(a) - parseInt(b),
        padding: 0.2
    }, {
            parent: "#right-chart-container",
            width: 800,
            height: 150,
            margin: { top: 50, left: 60, bottom: 50, right: 10 }
        }
    );



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
                            ]
                        }
                    }
                }
                return acc;
            },
            () => ({}) as Record<string, Series>,
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
            parent: "#right-chart-container",
            className: "col-12",
            height: 250,
            width: 700,
            margin: { top: 50, right: 100, bottom: 50, left: 90 }
        }
    )






    console.time("cloud");
    const wordCloud = new WordMap(
        data,
        accumulateMapper(
            (acc, season) => {
                for(const word in season.words) {
                    if(word in acc) {
                        acc[word] += season.words[word];
                    } else {
                        acc[word] = season.words[word];
                    }
                }
                return acc;
            },
            () => ({}) as Record<string, number>,
            (obj) => ({
                data: Object.entries(obj).map(([text, value]) => ({ text, value })).slice(0, 200),
                unknownCount: 0
            })
        ),
        {
            title: "Word Cloud"
        },
        {
            parent: '#left-chart-container',
            height: 400,
            width: 800,
            margin: { top: 50, left: 10, bottom: 10, right: 10 }
        }
    );
    console.timeEnd("cloud");
    visualizations.push(wordCloud);



    const treeCloud = new DirectedChord(
        data,
        accumulateMapper(
            (acc, ep) => {
                for(const line of ep.transcript) {
                    if(!IMPORTANT_CHARACTERS.includes(line.speaker)) { continue; }
                    for(const maybeTo of IMPORTANT_CHARACTERS) {
                        if(line.text.includes(maybeTo)) {
                            if(!(line.speaker in acc)) { acc[line.speaker] = {}; }
                            if(!(maybeTo in acc[line.speaker])) { acc[line.speaker][maybeTo] = 0; }
                            acc[line.speaker][maybeTo]++;
                        }
                    }
                }
                return acc;
            },
            () => ({}) as Record<string, Record<string, number>>,
            (acc) => {
                const data: ChordData[] = [];
                for(const [from, to_obj] of Object.entries(acc)) {
                    for(const [to, value] of Object.entries(to_obj)) {
                        data.push({
                            from, to, value
                        });
                    }
                }
                return {
                    data,
                    unknownCount: 0
                };
            }
        ),
        {
            title: "Character Mentions",
            colorMap: CHARACTER_COLOR_MAP,
            eventHandler: characterEventHandler
        },
        {
            parent: '#right-chart-container',
            width: 600,
            height: 600,
            margin: { top: 50, bottom: 5, right: 50, left: 50}
        }
    );
    visualizations.push(treeCloud);

    d3.select("#loader").remove();
}
