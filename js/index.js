"use strict";
d3.json("data/data.json")
    .then((rawData) => {
    const data = rawData;
    console.log(`Data loading complete: ${data.episodes.length} episodes.`);
    console.log("Example:", data.episodes[0]);
    return visualizeData(data.episodes);
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
const CHARACTER_COLOR_MAP = {
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
const IMPORTANT_CHARACTERS = Object.keys(CHARACTER_COLOR_MAP);
const filterBtnIds = [
    "#btn-filter-s1",
    "#btn-filter-s2",
    "#btn-filter-s3",
    "#btn-filter-s4",
];
function visualizeData(data) {
    const visualizations = [];
    function clearFilters() {
        visualizations.forEach((v) => {
            v.setData(data);
            v.render();
        });
    }
    const filterSeasonData = (season) => {
        visualizations.forEach((v) => {
            v.setData(data.filter((d) => d.season === season));
            v.render();
        });
    };
    let activeSeasonFilter = 0;
    function setSeasonFilter(s) {
        if (s === activeSeasonFilter) {
            return;
        }
        activeSeasonFilter = s;
        if (s === 0) {
            clearFilters();
            d3.select("#btn-filter-none")
                .attr("class", "btn btn-secondary");
            d3.selectAll(filterBtnIds.join(","))
                .attr("class", "btn btn-outline-primary");
        }
        else {
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
    });
    /** Used to dispatch character hover events to all visualizations */
    const characterEventHandler = new CharacterEventHandler();
    const episodesPerSeason = new BarChart(data, aggregateMapper((d) => d.season.toString(), (b, c) => ({ label: b, value: c, tooltip: `${c} Episodes`, color: SEASON_COLORS[parseInt(b) - 1] })), {
        xAxisLabel: "Season",
        yAxisLabel: "Episodes",
        onDataSelect: (d) => setSeasonFilter(parseInt(d.label))
    }, {
        parent: "#chart-container",
        className: "col-12",
        height: 200,
        width: 500,
        margin: { top: 50, right: 50, bottom: 50, left: 80 }
    });
    const linesPerCharacter = new BarChart(data, accumulateMapper((acc, ep) => {
        for (const line of ep.transcript) {
            if (!IMPORTANT_CHARACTERS.includes(line.speaker)) {
                continue;
            }
            if (line.speaker in acc) {
                acc[line.speaker]++;
            }
            else {
                acc[line.speaker] = 1;
            }
        }
        return acc;
    }, {}, (characterLines) => {
        return {
            data: Object.entries(characterLines).sort((a, b) => b[1] - a[1]).map(([speaker, lines]) => ({
                label: speaker, value: lines, color: CHARACTER_COLOR_MAP[speaker]
            })),
            unknownCount: 0
        };
    }), {
        xAxisLabel: "Character",
        yAxisLabel: "Lines",
        sort: (a, b) => b.value - a.value,
        eventHandler: characterEventHandler
    }, {
        parent: "#chart-container",
        className: "col-12",
        height: 200,
        width: 500,
        margin: { top: 50, right: 50, bottom: 50, left: 100 }
    });
    visualizations.push(linesPerCharacter);
    const linesPerEpisode = new MultiLineChart(data, accumulateMapper((acc, ep) => {
        const epLines = {};
        for (const line of ep.transcript) {
            if (!IMPORTANT_CHARACTERS.includes(line.speaker)) {
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
                    color: CHARACTER_COLOR_MAP[speaker],
                    values: [
                        { x: ep.abs_episode, y: epLines[speaker] }
                    ]
                };
            }
        }
        return acc;
    }, {}, (data) => ({ data: Object.values(data), unknownCount: 0 })), {
        title: "Character Lines per Episode",
        xAxisLabel: "Episode",
        yAxisLabel: "Lines",
        eventHandler: characterEventHandler
        // onMouseOver: (d) => console.log(`Mouse Over ${d.label}`)
    }, {
        parent: "#big-chart-container",
        className: "col-12",
        height: 400,
        width: 1000,
        margin: { top: 50, right: 100, bottom: 50, left: 90 }
    });
    visualizations.push(episodesPerSeason);
    const timelineHist = new BarChart(data, elementMapper((d) => {
        const label = d.abs_episode.toString();
        const value = d.transcript.length;
        return {
            label,
            value,
            tooltip: `${value} Lines`, color: EPISODE_COLOR_MAP[d.abs_episode - 1]
        };
    }), {
        xAxisLabel: "Total number of Episode",
        yAxisLabel: "Number of Lines",
        labelSort: (a, b) => parseInt(a) - parseInt(b),
        //colorScheme: scheme3
    }, {
        parent: "#big-chart-container",
        width: 1000,
        height: 150,
        margin: { top: 50, left: 100, bottom: 50, right: 50 }
    });
    console.time("cloud");
    const wordCloud = new WordMap(data, accumulateMapper((acc, season) => {
        for (const word in season.words) {
            if (word in acc) {
                acc[word] += season.words[word];
            }
            else {
                acc[word] = season.words[word];
            }
        }
        return acc;
    }, {}, (obj) => ({
        data: Object.entries(obj).map(([text, value]) => ({ text, value })).slice(0, 200),
        unknownCount: 0
    })), {}, {
        parent: '#big-chart-container',
        height: 400,
        width: 800
    });
    console.timeEnd("cloud");
    visualizations.push(wordCloud);
    d3.select("#loader").remove();
}
//# sourceMappingURL=index.js.map