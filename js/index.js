"use strict";
function parseCharacter(row) {
    return {
        Name: row.name,
        Url: row.url,
        Image_Url: row.imageUrl
    };
}
// helpers
function isMatch(searchOnString, searchText) {
    searchText = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return searchOnString.match(new RegExp("\\b" + searchText + "\\b", "i")) != null;
}
// d3.tsv('data/sampleData.tsv')
d3.json('data/episodes.json')
    .then((rawData) => {
    const data = rawData;
    console.log(`Data loading complete: ${data.length} episodes.`);
    console.log("Example:", data[0]);
    d3.csv('data/KorraCharacters.csv')
        .then((rawcharData) => {
        const charData = rawcharData.map(parseCharacter);
        console.log(`Character loading complete: ${charData.length} characters.`);
        console.log("Chatacter example:", charData[0]);
        return visualizeData(data, charData);
    }).catch(err => {
        console.error("Error loading Character data");
        console.error(err);
    });
})
    .catch(err => {
    console.error("Error loading Episode data");
    console.error(err);
});
function visualizeData(data, charData) {
    // const filters: Record<string, FilterFn> = {};
    // const rerenderData = () => {
    //     const filterfns = Object.values(filters);
    //     const filteredData = filterfns.reduce((fData, fn) => fData.filter(fn), data);
    //     currentData = filteredData;
    //     for (const viz of visualizations) {
    //         viz.setData(currentData);
    //         viz.render();
    //     }
    // }
    // const addFilter = (key: string, filterFn: FilterFn) => {
    //     filters[key] = filterFn;
    //     rerenderData()
    // }
    // const removeFilter = (key: string) => {
    //     delete filters[key];
    //     rerenderData()
    // }
    const findCharacterData = (name) => {
        let foundChar = charData.find(d => d.Name.toLowerCase() === name);
        if (foundChar == undefined) {
            //console.log("Trying again for",name);
            // Try secondary finding?
            foundChar = charData.find(d => isMatch(d.Name.toLowerCase(), name));
            if (foundChar) {
                //console.log("Found second time",foundChar,name)
            }
        }
        return foundChar;
    };
    const getCharacterTooltip = (name, label, value) => {
        var lowerName = name.toLowerCase();
        var charData = findCharacterData(lowerName);
        var image = charData === null || charData === void 0 ? void 0 : charData.Image_Url; // Might not exist
        var url = charData === null || charData === void 0 ? void 0 : charData.Url; // Unused due to difficulty
        var output = ` 
                        <div class='charBox'><b>${name}</b> </div>
                        <br>
                        <ul>
                        <li><b>${label}:</b> ${value}</li>
                        </ul>
                    `;
        if (charData != undefined) {
            output = ` 
                        <div class='charBox'>
                        <img src="${image}", width="80" height="65">
                        </div>
                        <b>${name}</b>
                        <br>
                        <b>${label}:</b> ${value}
                        `;
        }
        return output;
    };
    const getCharactersInData = (data) => {
        //console.log("Grabbing characters in selected episode set",data)
        let all_names = new Set();
        let all_characters = new Array();
        for (const episode of data) {
            episode.transcript.forEach(line => {
                all_names.add(line.speaker);
            });
        }
        for (const name of all_names) {
            let characterData = findCharacterData(name);
            let exists = all_characters.find(d => d.Name === (characterData === null || characterData === void 0 ? void 0 : characterData.Name)); // removes dupes
            if (characterData != undefined && !exists) {
                all_characters.push(characterData);
            }
        }
        return all_characters;
    };
    let charactersInData = getCharactersInData(data); // UPDATE THIS WITH NEW DATA SELECTION
    const characterEventHandler = new CharacterEventHandler();
    characterEventHandler.addEventHandler((ev, ch) => {
        //console.log(ev, ch);
        let eventChar = findCharacterData(ch);
        switch (ev) {
            case "hover":
                if (eventChar) {
                    charactersInData = charSortCharacterTable(charactersInData, eventChar);
                    updateCharTable(charactersInData);
                    boldCharTable(eventChar, true);
                }
                break;
            case "unhover":
                if (eventChar) { // unbold
                    boldCharTable(eventChar, false);
                }
                break;
        }
    });
    // characterEventHandler.
    const charSortCharacterTable = (data, character) => {
        let all_characters = new Array();
        all_characters.push(character); // prefills selected character to top of array
        for (const characterData of data) {
            let exists = all_characters.find(d => d.Name === (characterData === null || characterData === void 0 ? void 0 : characterData.Name)); // removes dupes and pushes rest of data
            if (characterData != undefined && !exists) {
                all_characters.push(characterData);
            }
            else {
                //console.log("already there",characterData.Name)
            }
        }
        return all_characters;
    };
    const boldCharTable = (char, bold) => {
        let name = char.Name;
        let tableSelect = Array.from(document.getElementsByClassName(`tbl-${name}`));
        for (let i = 0; i < tableSelect.length; i++) {
            let element = tableSelect[i];
            if (bold) {
                element.style.fontWeight = "bold";
            }
            else {
                element.style.fontWeight = "normal";
            }
        }
        ;
    };
    const updateCharTable = (charData) => {
        const num_colums = 4; // number of columns in the row
        let table = '<table>';
        // returns all characters found in selected data transcript
        table += `<tr><th>Characters</th>`;
        for (let charIndex = 0; charIndex < charData.length; charIndex += num_colums) {
            table = table + `<tr>`;
            for (let char_section = 0; char_section < num_colums; char_section++) {
                //console.log(char_section,charIndex + char_section);
                let character = charData[charIndex + char_section];
                if (character) {
                    table = table + `<td class= 'tbl-${character.Name}'> <img src="${character.Image_Url}", width="45" height="40"></td>`;
                    table = table + `<td class='tbl-${character.Name}' >${character.Name}</td>`;
                    table = table + `<td class='tbl-${character.Name}' ><a href='${character.Url}'> Details</a></td>  `;
                }
                else {
                    //console.log("Could not find character",charIndex,char_section)
                }
            }
            table += `</tr>`;
        }
        ;
        table += "</table>";
        let tablePlace = document.getElementById("characterTable");
        if (tablePlace) {
            tablePlace.innerHTML = table;
        }
    };
    updateCharTable(charactersInData); // Pass in episodes
    const episodesPerSeason = new BarChart(data, aggregateMapper((d) => d.season.toString(), (b, c) => ({ label: b, value: c, tooltip: `${c} Episodes` })), {
        xAxisLabel: "Season",
        yAxisLabel: "Episodes",
        colorScheme: d3.schemeCategory10
    }, {
        parent: "#chart-container",
        className: "col-12",
        height: 200,
        width: 500,
        margin: { top: 50, right: 50, bottom: 50, left: 80 }
    });
    const characterLines = data.reduce((acc, ep) => {
        for (const line of ep.transcript) {
            if (line.speaker in acc) {
                acc[line.speaker]++;
            }
            else {
                acc[line.speaker] = 1;
            }
        }
        return acc;
    }, {});
    const topTenCharacterLines = Object.entries(characterLines).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const topTenCharacters = topTenCharacterLines.map(([speaker, _]) => speaker);
    const characterColors = {};
    topTenCharacters.forEach((name, i) => {
        characterColors[name] = d3.schemeCategory10[i];
    });
    const linesPerCharacter = new BarChart(topTenCharacterLines, elementMapper(([speaker, lines]) => ({ label: speaker, value: lines, color: characterColors[speaker], tooltip: getCharacterTooltip(speaker, "Lines", lines) })), {
        xAxisLabel: "Character",
        yAxisLabel: "Lines",
        labelOrder: topTenCharacters,
        eventHandler: characterEventHandler
    }, {
        parent: "#chart-container",
        className: "col-12",
        height: 200,
        width: 500,
        margin: { top: 50, right: 50, bottom: 50, left: 100 }
    });
    const linesPerEpisode = new MultiLineChart(data, accumulateMapper((acc, ep) => {
        const epLines = {};
        for (const line of ep.transcript) {
            if (!topTenCharacters.includes(line.speaker)) {
                continue;
            }
            if (line.speaker in epLines) {
                epLines[line.speaker]++;
            }
            else {
                epLines[line.speaker] = 1;
            }
        }
        for (const speaker in epLines) {
            if (speaker in acc) {
                acc[speaker].values.push({ x: ep.abs_episode, y: epLines[speaker] });
            }
            else {
                acc[speaker] = {
                    label: speaker,
                    color: characterColors[speaker],
                    values: [
                        { x: ep.abs_episode, y: epLines[speaker] }
                    ],
                };
            }
        }
        return acc;
    }, {}, (data) => ({ data: Object.values(data), unknownCount: 0 })), {
        title: "Character Lines per Episode",
        xAxisLabel: "Episode",
        yAxisLabel: "Lines",
        eventHandler: characterEventHandler,
        tooltipFn: (d) => getCharacterTooltip(d.series.label, `Lines in Episode ${d.x}`, d.y)
    }, {
        parent: "#big-chart-container",
        className: "col-12",
        height: 400,
        width: 1000,
        margin: { top: 50, right: 100, bottom: 50, left: 90 }
    });
    /*
    const timelineHist = new DateHistogramChart(
        data,
        binDateDayMapper(
            (d) => d.REQUESTED_DATE,
            {
                bins: "weeks",
                startOfWeek: 1,
                dayOfMonth: 1
            }
        ), {
            xAxisLabel: "Date",
            yAxisLabel: "Calls",
            tooltipFn: (b) => b.x0 ? `${MONTH_NAMES[b.x0.getMonth()]} ${b.x0.getFullYear()}: ${b.length}` : `${b.length}`,
            onRegionSelect: (region) => {
                addFilter("timeline-brush", (d) => {
                    const t = d.REQUESTED_DATE?.getTime();
                    return t && t >= region[0].getTime() && t <= region[1].getTime();
                });
            }
        }, {
            parent: "#timeline-container",
            className: "h-100",
            width: 1000,
            height: 150,
            margin: { top: 50, left: 100, bottom: 50, right: 50 }
        }
    );



    // B Goal Charts
    // Day of Week popularity bar chart

    const categories = []; // list of grouped categories to prevent massive overfilling
    const dowBarChart = new BarChart(
        data,
        // the mapper tells the chart what data from the source `data` you actually want to plot
        // `aggregateMapper` is a way to group the data points into bins for a bar chart
        aggregateMapper(  //TODO: Need to sort by weekday as well. originally returns week day as number
            (d) => ((d.REQUESTED_DATE || new Date()).toLocaleString('en-us', {  weekday: 'short' })), // or whatever you want to group it by
            (b, count) => ({ label: b, value: count,
            tooltip: "Calls: " + count.toString(), // TODO: Adjust to actual value for some reason gives error when tooltip shows
            color: "#66aa77" })
        ),
        {// optional stuff to configure the bar chart, like axis labels
            xAxisLabel: "Day",
            yAxisLabel: "Calls",
            labelOrder: ["Sun","Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        },
        {
            parent: "#dow-trend-container",
            className: "h-100",
            width: 300,
            height: 100,
            margin: { top: 50, left: 100, bottom: 50, right: 50 }
        }
    );
    const myCategories = d3.rollups(
        data,
        (group) => group.length, // grab count of group
        (label) => label.SERVICE_NAME, // what to group them by
      );
    // filter the wierd ones with (<=25)
    let all_categories: Array<{ Category: string | undefined, Count: number }>
    let categoryNames: Array<string>
    all_categories = [];
    categoryNames = [];
    const countCutoff = 50;
    const subCategories = ["Building", "Tree","Rats","Weeds","Trash","Trash cart", "Sign","Sewage", "Vehicle", "Tall grass/weeds", "Yard Waste", "Recycling"]

    myCategories.forEach(d => { // get main big categoris
        let categoryData =  {Category: d[0], Count: d[1]}
        const count = d[1]
        if (count > countCutoff){ // if greater than cutoff, check for subcategory
            let catName = (d[0] || "Unkown").replace('"','');
            let firstWord = (catName.split(",")[0] || "Unkown");
            // If first word is a subcategory, add to specific category data instead of pushing new
            if (subCategories.includes(firstWord)){ // Compiles subcategories
                categoryData =  {Category: firstWord, Count: d[1]}
                let index = all_categories.findIndex(d => d.Category == firstWord); // find index of existing obj
                // if index == -1 (not found) then add new category data, else: append count to existing category
                if (index == -1){
                    all_categories.push(categoryData);
                }else{
                    all_categories[index].Count += d[1];
                }

            }else{ // if not a subcategory, then just add to categories
                categoryData.Category = replaceAll(categoryData.Category,'"','');
                all_categories.push(categoryData);
            }
        } else{ // categorize as misc. appends to existing
            categoryData.Category = "Misc.";
            let index = all_categories.findIndex(d => d.Category == "Misc.");
                if (index == -1){
                    all_categories.push(categoryData);
                }else{
                    all_categories[index].Count += d[1];
                }
        }
    });
    // Sort data from large to small
    all_categories.sort((a, b) => b.Count - a.Count); // TODO: had original plans to make dynamic sorting buttons but was hard to manage in ts
    const CategoryBarChart = new HorizontalBarChart(
        all_categories,
        // the mapper tells the chart what data from the source `data` you actually want to plot
        // `aggregateMapper` is a way to group the data points into bins for a bar chart
        //TODO: figure out tooltip workings
        straightMapper(
            (d) => d.Category,
            (b, count) => ({
                label: b,
                value: count,
                tooltip: "Calls: " + count.toString(), // TODO: Adjust to actual value for some reason gives error when tooltip shows
            }),
            "Count"
        ),
        {// optional stuff to configure the bar chart, like axis labels
            xAxisLabel: "Calls",
            yAxisLabel: "Call Categories",
            colorScheme: ["#66aa77"]
        },
        {
            parent: "#category-trend-container",
            className: "h-100",
            width: 250,
            height: 400,
            margin: { top: 50, left: 200, bottom: 50, right: 50 }
        }
    );

    // DONUT CHART
    // VISION:
    // Take averages of time between request and update for all selected points
    // possibly clock shaped? or maybe a bar/timeline structure
    // selected data = ???
    //NOTICE: Moved entire chart over to pieChartTest.js and timePie.html

    // Stacked Bar Chart
    const stackData = [
        {'xValue': "Jan", 'yValue':0, 'zValue':0 , 'aValue':0 },
        {'xValue': "Feb", 'yValue':0, 'zValue':0,  'aValue':0 },
        {'xValue': "Mar", 'yValue':0, 'zValue':0, 'aValue':0 },
        {'xValue': "Apr", 'yValue':0, 'zValue':0, 'aValue':0 },
        {'xValue': "May", 'yValue':0, 'zValue':0, 'aValue':0 },
        {'xValue': "Jun", 'yValue':0, 'zValue':0, 'aValue':0 },
        {'xValue': "Jul", 'yValue':0, 'zValue':0, 'aValue':0 },
        {'xValue': "Aug", 'yValue':0, 'zValue':0, 'aValue':0 },
        {'xValue': "Sept", 'yValue':0, 'zValue':0, 'aValue':0 },
        {'xValue': "Oct", 'yValue':0, 'zValue':0, 'aValue':0 },
        {'xValue': "Nov", 'yValue':0, 'zValue':0, 'aValue':0 },
        {'xValue': "Dec", 'yValue':0, 'zValue':0, 'aValue':0 },
    ];
    for(const d of data) {
        if(!d.REQUESTED_DATE) { return; }
        const stackMonth = stackData[d.REQUESTED_DATE?.getMonth()];
        switch(d.STATUS) {
            case "OPEN": stackMonth.yValue++; break;
            case "CLOS": stackMonth.zValue++; break;
            default: stackMonth.aValue++; break;
        }
    }
    const stackChart = new StackedBarChart(
        stackData,
        {
            parent: "#side-panel",
            width: 300,
            height: 150,
            margin: { left: 70, top: 50, right: 50, bottom: 70 }
        }
    )
    */
    d3.select("#loader").remove();
}
//# sourceMappingURL=index.js.map