"use strict";
// d3.tsv('data/sampleData.tsv')
d3.json('data/episodes.json')
    .then((rawData) => {
    const data = rawData;
    console.log(`Data loading complete: ${data.length} episodes.`);
    console.log("Example:", data[0]);
    return visualizeData(data);
})
    .catch(err => {
    console.error("Error loading the data");
    console.error(err);
});
const SEASON_COLORS = [
    "#e41a1c", "#377eb8", "#4daf4a", "#984ea3"
];
const EPISODE_COLOR_MAP = [
    ...new Array(12).fill(SEASON_COLORS[0]),
    ...new Array(14).fill(SEASON_COLORS[1]),
    ...new Array(13).fill(SEASON_COLORS[2]),
    ...new Array(13).fill(SEASON_COLORS[3]),
];
function visualizeData(data) {
    const visualizations = [];
    const newData = data;
    const filterData = (newData) => {
        visualizations.forEach((v) => {
            v.setData(newData);
            v.render();
        });
    };
    d3.select("#btn-reset-s1").on("click", () => {
        filterData(data.filter((d) => d.season === 1));
    });
    d3.select("#btn-reset-s2").on("click", () => {
        filterData(data.filter((d) => d.season === 2));
    });
    d3.select("#btn-reset-s3").on("click", () => {
        filterData(data.filter((d) => d.season === 3));
    });
    d3.select("#btn-reset-s4").on("click", () => {
        filterData(data.filter((d) => d.season === 4));
    });
    d3.select("#btn-reset-season").on("click", () => {
        filterData(data.filter((d) => [1, 2, 3, 4].includes(d.season)));
    });
    /*
    const scheme1 = [ "#e41a1c", "#377eb8", "#4daf4a", "#984ea3"];
    const scheme2 = ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"]
    const scheme3 = ["#e41a1c","#e41a1c","#e41a1c","#e41a1c","#e41a1c","#e41a1c","#e41a1c","#e41a1c","#e41a1c","#e41a1c","#e41a1c","#e41a1c",
    "#377eb8", "#377eb8","#377eb8","#377eb8","#377eb8","#377eb8","#377eb8","#377eb8","#377eb8","#377eb8","#377eb8","#377eb8","#377eb8","#377eb8",
    "#4daf4a","#4daf4a","#4daf4a","#4daf4a","#4daf4a","#4daf4a","#4daf4a","#4daf4a","#4daf4a","#4daf4a","#4daf4a","#4daf4a","#4daf4a",
    "#984ea3","#984ea3","#984ea3","#984ea3","#984ea3","#984ea3","#984ea3","#984ea3","#984ea3","#984ea3","#984ea3","#984ea3","#984ea3"];
    */
    const colorMap2 = {
        "Korra": "#8dd3c7",
        "Lin": "#ffffb3",
        "Tarrlok": "#bebada",
        "Toph": "#fb8072",
        "Tenzin": "#80b1d3",
        "Jinora": "#fdb462",
        "Iroh": "#b3de69",
        "Mako": "#fccde5",
        "Bolin": "#d9d9d9",
        "Asami": "#bc80bd",
        "Suyin": "#ccebc5",
        "Kuvira": "#ffed6f",
    };
    const episodesPerSeason = new BarChart(data, aggregateMapper((d) => d.season.toString(), (b, c) => ({ label: b, value: c, tooltip: `${c} Episodes`, color: SEASON_COLORS[parseInt(b) - 1] })), {
        xAxisLabel: "Season",
        yAxisLabel: "Episodes",
        //colorScheme: scheme1
    }, {
        parent: "#chart-container",
        className: "col-12",
        height: 200,
        width: 500,
        margin: { top: 50, right: 50, bottom: 50, left: 80 }
    });
    visualizations.push(episodesPerSeason);
    const charData = [
        { 'xValue': "Korra", 'yValue': 0 },
        { 'xValue': "Lin", 'yValue': 0 },
        { 'xValue': "Tarrlok", 'yValue': 0 },
        { 'xValue': "Toph", 'yValue': 0 },
        { 'xValue': "Tenzin", 'yValue': 0 },
        { 'xValue': "Jinora", 'yValue': 0 },
        { 'xValue': "Iroh", 'yValue': 0 },
        { 'xValue': "Mako", 'yValue': 0 },
        { 'xValue': "Bolin", 'yValue': 0 },
        { 'xValue': "Asami", 'yValue': 0 },
        { 'xValue': "Suyin", 'yValue': 0 },
        { 'xValue': "Kuvira", 'yValue': 0 },
    ];
    data = newData;
    let episode = [];
    const season1 = [];
    const season2 = [];
    const season3 = [];
    const season4 = [];
    for (let i = 0; i < 52; i++) {
        episode.push(data[i].transcript);
        if (i <= 11) {
            season1.push(data[i]);
        }
        else if (i > 11 && i <= 25) {
            season2.push(data[i]);
        }
        else if (i > 11 && i <= 25) {
            season3.push(data[i]);
        }
        else {
            season4.push(data[i]);
        }
    }
    for (let i = 0; i < 52; i++) {
        let transcript = episode[i];
        transcript.forEach(text => {
            if (text.speaker == "Korra") {
                charData[0].yValue = charData[0].yValue + 1;
            }
            else if (text.speaker == "Lin") {
                charData[1].yValue = charData[1].yValue + 1;
            }
            else if (text.speaker == "Tarrlok") {
                charData[2].yValue = charData[2].yValue + 1;
            }
            else if (text.speaker == "Toph") {
                charData[3].yValue = charData[3].yValue + 1;
            }
            else if (text.speaker == "Tenzin") {
                charData[4].yValue = charData[4].yValue + 1;
            }
            else if (text.speaker == "Jinora") {
                charData[5].yValue = charData[5].yValue + 1;
            }
            else if (text.speaker == "Iroh") {
                charData[6].yValue = charData[6].yValue + 1;
            }
            else if (text.speaker == "Mako") {
                charData[7].yValue = charData[7].yValue + 1;
            }
            else if (text.speaker == "Bolin") {
                charData[8].yValue = charData[8].yValue + 1;
            }
            else if (text.speaker == "Asami") {
                charData[9].yValue = charData[9].yValue + 1;
            }
            else if (text.speaker == "Suyin") {
                charData[10].yValue = charData[10].yValue + 1;
            }
            else if (text.speaker == "Kuvira") {
                charData[11].yValue = charData[11].yValue + 1;
            }
        });
    }
    const linedata = charData.map(d => ({ label: d.xValue, value: d.yValue, tooltip: `${d.yValue} Lines` }));
    const linesPerCharacter = new HorizontalBarChart(charData, elementMapper((d => ({ label: d.xValue, value: d.yValue, tooltip: `${d.yValue} Lines`, color: colorMap2[d.xValue] }))), {
        xAxisLabel: "Character",
        yAxisLabel: "Total Number of Lines",
        //colorScheme: scheme2
    }, {
        parent: "#character-lines",
        height: 200,
        width: 500,
        margin: { top: 20, right: 20, bottom: 50, left: 100 }
    });
    let timeline_lines = new Array(52).fill(undefined).map(() => [0]);
    for (let i = 0; i < 52; i++) {
        let num_lines = episode[i];
        num_lines.forEach(text => {
            timeline_lines[i][0] = timeline_lines[i][0] + 1;
        });
    }
    console.log(timeline_lines);
    const timelineData = [];
    for (let i = 1; i <= 52; i++) {
        timelineData.push({
            xValue: i.toString(),
            yValue: 0
        });
    }
    for (let i = 0; i < 52; i++) {
        const val = timeline_lines[i][0];
        timelineData[i].yValue = val;
    }
    console.log(timelineData);
    const timelineHist = new BarChart(timelineData, elementMapper((d => ({ label: d.xValue, value: d.yValue, tooltip: `${d.yValue} Lines`, color: EPISODE_COLOR_MAP[parseInt(d.xValue) - 1] }))), {
        xAxisLabel: "Total number of Episode",
        yAxisLabel: "Number of Lines",
        labelSort: (a, b) => parseInt(a) - parseInt(b),
        //colorScheme: scheme3
    }, {
        parent: "#timeline-container",
        width: 1000,
        height: 150,
        margin: { top: 50, left: 100, bottom: 50, right: 50 }
    });
    const wordCloud = new Wordmap({
        parent: '#wordmap',
        height: 500,
        width: 300
    }, data);
    d3.select("#loader").remove();
}
//# sourceMappingURL=index.js.map