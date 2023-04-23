"use strict";
const COMMON_WORDS = new Set("with,all,on,don't,like,she,so,just,can,get,for,the,you,to,i'm,i've,and,a,me,of,in,it,it's,that's,too,is,you're,your,this,i,we,me,us,our,ours,ourselves,myself,you,yours,yours,my,he,him,her,it,they, hem,himself,herself,themselves,their,who,whom,what,which,where,this,that,those,is,am,are,was,were,has,have,had been,be,were,had,have,this,those,did,do,does,will,could,would,let's,if,but,and,a,an,the,if,because,as,while,until,about,into,through,before,after,during,in,out,here,there,when,some,no,not,only,say,says,said,shall,own".split(","));
/** Manual import since typing is outdated. */
const makeCloud = d3.layout.cloud;
class WordMap extends AbstractVisualization {
    constructor(rawData, dataMapper, chartConfig, drawConfig) {
        super();
        this.dataMapper = dataMapper;
        this.chartConfig = chartConfig;
        this.drawConfig = drawConfig;
        this.colorScale = d3.scaleThreshold()
            .domain([1, 10, 50, 100, 300, 500])
            .range(["#CCE5FF", "#99C2FF", "#66A3FF", "#3377FF", "#0047B3", "#002147"]);
        this.fontFamily = "Helvetica";
        this.fontScale = 3;
        this.rotate = () => 0;
        this.padding = 2;
        this.margin = drawConfig.margin || { top: 0, bottom: 0, left: 0, right: 0 };
        this.svg = createSVG(drawConfig);
        this.ctx = this.svg.append("g")
            .attr("class", "chart-area")
            .attr("transform", `translate(${this.margin.left + this.drawConfig.width / 2}, ${this.margin.top + this.drawConfig.height / 2})`)
            .attr("font-family", this.fontFamily)
            .attr("text-anchor", "middle");
        this.setData(rawData);
        if (chartConfig.title) {
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
            .on("end", (words) => {
            this.ctx.selectAll(".word-cloud-word").data(words).join("text")
                .attr("class", "word-cloud-word")
                .attr("font-size", (d) => d.size)
                .attr("transform", (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
                .style("fill", (d) => this.colorScale(Math.pow(d.size / this.fontScale, 2)))
                .text((d) => d.text);
        });
        this.render();
    }
    render() {
        this.cloud.stop();
        this.cloud.words(this.data);
        this.cloud.start();
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
    }
}
//# sourceMappingURL=WordCloud.js.map