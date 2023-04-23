
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




function visualizeData(data: KorraEpisode[]) {

    const visualizations: AbstractVisualization<KorraEpisode, unknown, VisualizationConfig<any>>[] = [];

    const filterData = (newData: KorraEpisode[]) => {
        visualizations.forEach((v) => {
            v.setData(newData);
            v.render();
        });
    }

    function setSeasonFilter(s: number) {
        const filterBtnIds = [
            "btn-filter-s1",
            "btn-filter-s2",
            "btn-filter-s3",
            "btn-filter-s4",
        ];
        if(s === 0) {
            filterData(data);
            d3.select("#btn-filter-none")
                .attr("class", "btn btn-secondary");
            d3.selectAll(filterBtnIds.map((id) => `#${id}`).join(","))
                .attr("class", "btn btn-outline-primary");
        } else {
            filterData(data.filter((d) => d.season === s));
            d3.select("#btn-filter-none")
                .attr("class", "btn btn-outline-secondary");
            d3.selectAll(filterBtnIds.map((id) => `#${id}`).join(","))
                .attr("class", "btn btn-outline-primary");
            d3.select(`#btn-filter-s${s}`)
                .attr("class", "btn btn-primary");
        }
    }

    d3.select("#btn-filter-s1").on("click", () => setSeasonFilter(1));
    d3.select("#btn-filter-s2").on("click", () => setSeasonFilter(2));
    d3.select("#btn-filter-s3").on("click", () => setSeasonFilter(3));
    d3.select("#btn-filter-s4").on("click", () => setSeasonFilter(4));
    d3.select("#btn-filter-none").on("click", () => setSeasonFilter(0));



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
            eventHandler: characterEventHandler
            // onMouseOver: (d) => console.log(`Mouse Over ${d.label}`)
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
