
d3.json("data/data.json")
    .then((rawData) => {
        const data = rawData as LoadedData;
        console.log(`Data loading complete: ${data.episodes.length} episodes.`);
        console.log("Example:", data.episodes[0]);
        return visualizeData(data.episodes);
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



function visualizeData(data: KorraEpisode[]) {

    const visualizations: AbstractVisualization<KorraEpisode, unknown, VisualizationConfig<any>>[] = [];

    function clearFilters() {
        visualizations.forEach((v) => {
            v.setData(data);
            v.render();
        });
    }
    const filterSeasonData = (season: number) => {
        visualizations.forEach((v) => {
            v.setData(data.filter((d) => d.season === season));
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



    /** Used to dispatch character hover events to all visualizations */
    const characterEventHandler = new CharacterEventHandler();



    const episodesPerSeason = new BarChart(
        data,
        aggregateMapper(
            (d) => d.season.toString(),
            (b, c) => ({ label: b, value: c, tooltip: `${c} Episodes`, color: SEASON_COLORS[parseInt(b) - 1] })
        ),
        {
            xAxisLabel: "Season",
            yAxisLabel: "Episodes",
            onDataSelect: (d) => setSeasonFilter(parseInt(d.label))
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
            eventHandler: characterEventHandler,
            padding: 0.2,
            xTickRotate: -45
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
                    tooltip: `s${padNumber(d.season, 2)}e${padNumber(d.episode, 2)} Lines: ${value}`, color: EPISODE_COLOR_MAP[d.abs_episode - 1]
                };
            }
        ),
    {
        xAxisLabel: "Total number of Episode",
        yAxisLabel: "Number of Lines",
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
            eventHandler: characterEventHandler
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
