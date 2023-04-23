"use strict";
class Wordmap {
    constructor(_config, _data) {
        this.repeat_words = new Set();
        this.rotate = () => 0;
        this.fontFamily = "Arial";
        this.fontScale = 1;
        this.padding = 0;
        this.colors = d3.scaleThreshold();
        this.width = 500;
        this.height = 500;
        this.svg = d3.select("body")
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
        this.chart = this.svg
            .append("g")
            .attr("transform", `translate(${this.width / 2},${this.height / 2})`);
        this.config = {
            title: _config.title || "Word Cloud",
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 140,
            margin: { top: 30, bottom: 5, right: 5, left: 10 }
        };
        this.data = _data;
        this.initVis();
    }
    initVis() {
        let vis = this;
        vis.repeat_words = new Set("with,all,on,don't,like,she,so,just,can,get,for,the,you,to,i'm,i've,and,a,me,of,in,it,is,you're,your,this,i,we,me,us,our,ours,ourselves,myself,you,yours,yours,my,he,him,her,it,they, hem,himself,herself,themselves,their,who,whom,what,which,where,this,that,those,is,am,are,was,were,has,have,had been,be,were,had,have,this,those,did,do,does,will,could,would,let's,if,but,and,a,an,the,if,because,as,while,until,about,into,through,before,after,during,in,out,here,there,when,some,no,not,only,say,says,said,shall,own".split(","));
        vis.rotate = () => 0; //to keep stationary
        //vis.fontFamily = "sans-serif";
        vis.fontFamily = "Helvetica";
        vis.fontScale = 3;
        vis.padding = 2;
        vis.colors = d3.scaleThreshold()
            .domain([1, 10, 50, 100, 300, 500])
            .range(["#CCE5FF", "#99C2FF", "#66A3FF", "#3377FF", "#0047B3", "#002147"]);
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
        //Generation of chart systems
        vis.chart = vis.svg.append('g')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .attr("font-family", vis.fontFamily)
            .attr("text-anchor", "middle")
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
        vis.svg.append("rect")
            .attr('x', 2)
            .attr('y', 135)
            .attr('height', 200)
            .attr('width', 90)
            .attr('fill', 'white')
            .attr('stroke', "black")
            .attr('stroke-width', 1);
        vis.svg.append("text")
            .attr("x", 7)
            .attr("y", 150)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .text("Occurrences:");
        vis.svg.selectAll("legdots")
            .data([0.99, 9.99, 49.99, 99.99, 299.99, 499.99, 500])
            .enter()
            .append("circle")
            .attr("cx", 12)
            .attr("cy", function (d, i) { return 170 + i * 15; })
            .attr("r", 5)
            .style("fill", function (d) { return vis.colors(d); });
        vis.svg.selectAll("leglabels")
            .data(["1", "2-10", "11-50", "51-100", "101-300", "301-500", "501+"])
            .enter()
            .append("text")
            .attr("x", 22)
            .attr("y", function (d, i) { return 170 + i * 15; })
            .style("fill", "black")
            .text(function (d) { return d; })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");
        let font_size = 14;
        //label for title
        vis.svg.append("g")
            .attr('transform', 'translate(' + (vis.width / 2) + ', ' + (font_size + 4) + ')')
            .append('text')
            .attr('text-anchor', 'middle')
            .text(vis.config.title)
            .attr("font-weight", "bold")
            .attr('font-size', font_size + 4);
        vis.renderVis(vis.data);
    }
    renderVis(data) {
        let vis = this;
        let episode = [];
        for (let i = 0; i < vis.data.length; i++) {
            episode.push(vis.data[i].transcript);
        }
        vis.all_text = "";
        for (let i = 0; i < vis.data.length; i++) {
            let transcript = episode[i];
            transcript.forEach((text) => {
                vis.all_text += text.text;
            });
        }
        vis.text = vis.all_text
            .trim()
            .split(/[\s.]+/g)
            .map((w) => w.replace(/^[“‘"\-—()[\]{}]+/g, ""))
            .map((w) => w.replace(/[;:.!?()[\]{},"'’”\-—]+$/g, ""))
            .map((w) => w.replace(/['’]s$/g, ""))
            .map((w) => w.substring(0, 30))
            .map((w) => w.toLowerCase())
            .filter((w) => w && !vis.repeat_words.has(w));
        vis.wordData = d3.rollups(vis.text, (group) => group.length, (w) => w)
            .sort(([, a], [, b]) => d3.descending(a, b))
            .slice(0, 250)
            .map(([text, value]) => ({ text, value }));
        vis.fontScale = 70 / Math.sqrt(vis.wordData[0].value);
        console.log(vis.wordData);
        vis.w_cloud = d3.layout
            .cloud()
            .size([vis.width, vis.height])
            .words(vis.wordData.map((d) => Object.create(d)))
            .padding(vis.padding)
            .rotate(vis.rotate)
            .font(vis.fontFamily)
            .fontSize((d) => Math.sqrt(d.value) * vis.fontScale)
            .on("word", ({ size, x, y, rotate, text }) => {
            vis.chart
                .append("text")
                .attr("class", "words")
                .attr("font-size", size)
                .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
                .style("fill", function (d) {
                return vis.colors(Math.pow(size / vis.fontScale, 2));
            })
                .text(text);
        });
        console.log(vis.text);
        vis.w_cloud.start();
    }
    updateVis(data) {
        let vis = this;
        vis.w_cloud.stop();
        vis.chart.selectAll('text').remove();
        vis.renderVis(data);
    }
}
//# sourceMappingURL=Wordcloud.js.map