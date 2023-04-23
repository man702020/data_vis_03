


interface WordMapConfig extends VisualizationConfig<Word> {
    title?: string;
    colors?: readonly string[];
}

const COMMON_WORDS = new Set("with,all,on,don't,like,she,so,just,can,get,for,the,you,to,i'm,i've,and,a,me,of,in,it,it's,that's,too,is,you're,your,this,i,we,me,us,our,ours,ourselves,myself,you,yours,yours,my,he,him,her,it,they, hem,himself,herself,themselves,their,who,whom,what,which,where,this,that,those,is,am,are,was,were,has,have,had been,be,were,had,have,this,those,did,do,does,will,could,would,let's,if,but,and,a,an,the,if,because,as,while,until,about,into,through,before,after,during,in,out,here,there,when,some,no,not,only,say,says,said,shall,own".split(","));



/** Manual import since typing is outdated. */
const makeCloud = (d3 as any).layout.cloud as <T extends Word>() => Cloud<T>;



class WordMap<T> extends AbstractVisualization<T, Word, WordMapConfig>
{
    protected svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    protected ctx: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    protected cloud!: Cloud<Word>;

    protected margin: Margin;

    private colorScale = d3.scaleThreshold<number, string>()
        .domain([1, 10, 50, 100, 300, 500])
        .range(["#CCE5FF", "#99C2FF", "#66A3FF", "#3377FF", "#0047B3", "#002147"]);

    private fontFamily = "Helvetica";
    private fontScale = 3;
    private rotate = () => 0;
    private padding = 2;

    public constructor(
        rawData: T[],
        protected dataMapper: DataMapperFn<T, Word>,
        protected chartConfig: WordMapConfig,
        protected drawConfig: DrawConfig,
    ) {
        super();

        this.margin = drawConfig.margin || { top: 0, bottom: 0, left: 0, right: 0 };
        this.svg = createSVG(drawConfig);
        this.ctx = this.svg.append("g")
            .attr("class", "chart-area")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .attr("font-family", this.fontFamily)
            .attr("text-anchor", "middle");

        this.setData(rawData);

        if(chartConfig.title) {
            this.svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", this.margin.left + this.drawConfig.width / 2)
                .attr("y", this.margin.top - 10)
                .html(chartConfig.title);
        }

        this.svg.append("rect")
            .attr('x', 2)
            .attr('y', 135)
            .attr('height', 150)
            .attr('width', 105)
            .attr('fill', 'white')
            .attr('stroke', "black")
            .attr('stroke-width', 1);
        this.svg.append("text")
            .attr("x", 7)
            .attr("y", 150)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .text("Occurrences:");
        this.svg.selectAll("legdots")
            .data([0.99, 9.99, 49.99, 99.99, 299.99, 499.99, 500])
            .enter()
            .append("circle")
            .attr("cx", 12)
            .attr("cy", (d, i) => 170 + i * 15)
            .attr("r", 5)
            .style("fill", (d) => this.colorScale(d));
        this.svg.selectAll("leglabels")
            .data(["1", "2-10", "11-50", "51-100", "101-300", "301-500", "501+"])
            .enter()
            .append("text")
            .attr("x", 22)
            .attr("y", (d, i) => 170 + i * 15)
            .style("fill", "black")
            .text((d) => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");


        this.cloud = makeCloud()
            .size([this.drawConfig.width, this.drawConfig.height])
            .padding(this.padding)
            .rotate(this.rotate)
            .font(this.fontFamily)
            .fontSize((d) => Math.sqrt(d.value) * this.fontScale)
            .on("word", ({ size, x, y, rotate, text }) => {
                this.ctx
                    .append("text")
                    .attr("class", "words")
                    .attr("font-size", size!)
                    .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
                    .style("fill", (d) => this.colorScale(Math.pow(size! / this.fontScale, 2)))
                .text(text);
            });

        this.render();
    }


    public render() {
        // let episode = [];
        // for (let i = 0; i < this.data.length; i++) {
        //     episode.push(this.data[i].transcript);
        // }
        // this.all_text = "";
        // for (let i = 0; i < this.data.length; i++) {
        //     let transcript = episode[i];
        //     transcript.forEach((text) => {
        //         this.all_text += text.text;
        //     });
        // }
        // this.text = this.all_text
        //     .trim()
        //     .split(/[\s.]+/g)
        //     .map((w) => w.replace(/^[“‘"\-—()[\]{}]+/g, ""))
        //     .map((w) => w.replace(/[;:.!?()[\]{},"'’”\-—]+$/g, ""))
        //     .map((w) => w.replace(/['’]s$/g, ""))
        //     .map((w) => w.substring(0, 30))
        //     .map((w) => w.toLowerCase())
        //     .filter((w) => w && !this.repeat_words.has(w));
        // this.wordData = d3.rollups(this.text, (group) => group.length, (w) => w)
        //     .sort(([, a], [, b]) => d3.descending(a, b))
        //     .slice(0, 250)
        //     .map(([text, value]) => ({ text, value }));
        // this.fontScale = 70 / Math.sqrt(this.wordData[0].value);
        // console.log(this.wordData);
        this.cloud.stop();
        this.cloud.words(this.data);
        this.cloud.start();
    }
}





interface Word {
    text: string;
    value: number;
    font?: string | undefined;
    style?: string | undefined;
    weight?: string | number | undefined;
    rotate?: number | undefined;
    size?: number | undefined;
    padding?: number | undefined;
    x?: number | undefined;
    y?: number | undefined;
}

interface Cloud<T extends Word> {
    start(): Cloud<T>;
    stop(): Cloud<T>;

    timeInterval(): number;
    timeInterval(interval: number): Cloud<T>;

    words(): T[];
    words(words: T[]): Cloud<T>;

    size(): [number, number];
    size(size: [number, number]): Cloud<T>;

    font(): (datum: T, index: number) => string;
    font(font: string | ((datum: T, index: number) => string)): Cloud<T>;

    fontStyle(): (datum: T, index: number) => string;
    fontStyle(style: string | ((datum: T, index: number) => string)): Cloud<T>;

    fontWeight(): (datum: T, index: number) => string | number;
    fontWeight(weight: string | number | ((datum: T, index: number) => string | number)): Cloud<T>;

    rotate(): (datum: T, index: number) => number;
    rotate(rotate: number | ((datum: T, index: number) => number)): Cloud<T>;

    text(): (datum: T, index: number) => string;
    text(text: string | ((datum: T, index: number) => string)): Cloud<T>;

    spiral(): (size: [number, number]) => (t: number) => [number, number];
    spiral(name: string | ((size: [number, number]) => (t: number) => [number, number])): Cloud<T>;

    fontSize(): (datum: T, index: number) => number;
    fontSize(size: number | ((datum: T, index: number) => number)): Cloud<T>;

    padding(): (datum: T, index: number) => number;
    padding(padding: number | ((datum: T, index: number) => number)): Cloud<T>;

    /**
     * If specified, sets the internal random number generator,used for selecting the initial position of each word,
     * and the clockwise/counterclockwise direction of the spiral for each word.
     *
     * @param randomFunction should return a number in the range [0, 1).The default is Math.random.
     */
    random(): Cloud<T>;
    random(randomFunction: () => number): Cloud<T>;

    /**
     * If specified, sets the canvas generator function, which is used internally to draw text.
     * When using Node.js, you will almost definitely override the default, e.g. using the canvas module.
     * @param canvasGenerator should return a HTMLCanvasElement.The default is:  ()=>{document.createElement("canvas");}
     *
     */
    canvas(): Cloud<T>;
    canvas(canvasGenerator: () => HTMLCanvasElement): Cloud<T>;

    on(type: 'word', listener: (word: T) => void): Cloud<T>;
    on(type: 'end', listener: (tags: T[], bounds: { x: number; y: number }[]) => void): Cloud<T>;
    on(type: string, listener: (...args: any[]) => void): Cloud<T>;

    on(type: 'word'): (word: T) => void;
    on(type: 'end'): (tags: T[], bounds: { x: number; y: number }[]) => void;
    on(type: string): (...args: any[]) => void;
}
