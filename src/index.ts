

// d3.tsv('data/sampleData.tsv')
d3.json('data/episodes.json')
    .then((rawData) => {
        const data = rawData as KorraEpisode[];
        console.log(`Data loading complete: ${data.length} episodes.`);
        console.log("Example:", data[0]);
        return visualizeData(data);
    })
    .catch(err => {
        console.error("Error loading the data");
        console.error(err);
    });



type FilterFn = (d: KorraEpisode) => boolean | undefined | 0;



function visualizeData(data: KorraEpisode[]) {
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



    const episodesPerSeason = new BarChart(
        data,
        aggregateMapper(
            (d) => d.season.toString(),
            (b, c) => ({ label: b, value: c, tooltip: `${c} Episodes` })
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
    );

    const characterLines = data.reduce((acc, ep) => {
        for(const line of ep.transcript) {
            if(line.speaker in acc) {
                acc[line.speaker]++;
            } else {
                acc[line.speaker] = 1;
            }
        }
        return acc;
    }, {  } as Record<string, number>);
    const topTenCharacterLines = Object.entries(characterLines).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const topTenCharacters = topTenCharacterLines.map(([ speaker, _ ]) => speaker);
    const characterColors: Record<string, string> = {};
    topTenCharacters.forEach((name, i) => {
        characterColors[name] = d3.schemeCategory10[i]
    });

    const linesPerCharacter = new BarChart(
        topTenCharacterLines,
        elementMapper(
            ([ speaker, lines]) => ({ label: speaker, value: lines, color: characterColors[speaker] })
        ),
        {
            xAxisLabel: "Character",
            yAxisLabel: "Lines",
            labelOrder: topTenCharacters
        },
        {
            parent: "#chart-container",
            className: "col-12",
            height: 200,
            width: 500,
            margin: { top: 50, right: 50, bottom: 50, left: 100 }
        }
    )

    const linesPerEpisode = new MultiLineChart(
        data,
        accumulateMapper(
            (acc, ep) => {
                const epLines = {} as Record<string, number>;
                for(const line of ep.transcript) {
                    if(!topTenCharacters.includes(line.speaker)) { continue; }
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
                            color: characterColors[speaker],
                            values: [
                                { x: ep.abs_episode, y: epLines[speaker] }
                            ]
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
        },
        {
            parent: "#big-chart-container",
            className: "col-12",
            height: 400,
            width: 1000,
            margin: { top: 50, right: 100, bottom: 50, left: 90 }
        }
    )

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
