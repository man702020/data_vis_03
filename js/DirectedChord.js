"use strict";
class DirectedChord extends AbstractVisualization {
    // protected colorScheme = ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"];
    constructor(rawData, dataMapper, chartConfig, drawConfig) {
        var _a;
        super();
        this.dataMapper = dataMapper;
        this.chartConfig = chartConfig;
        this.drawConfig = drawConfig;
        this.margin = drawConfig.margin || { top: 0, bottom: 0, left: 0, right: 0 };
        this.svg = createSVG(drawConfig);
        this.ctx = this.svg.append("g")
            .attr("class", "chart-area")
            .attr("transform", `translate(${this.margin.left + this.drawConfig.width / 2}, ${this.margin.top + this.drawConfig.height / 2})`);
        this.setData(rawData);
        if (chartConfig.title) {
            this.svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", this.margin.left + this.drawConfig.width / 2)
                .attr("y", this.margin.top - 10)
                .html(chartConfig.title);
        }
        this.chord = d3.chordDirected();
        this.innerRadius = Math.min(this.drawConfig.width, this.drawConfig.height) / 2 - 20;
        this.outerRadius = this.innerRadius + 6;
        this.textPath = this.ctx.append("path")
            .attr("id", "chord-text-path")
            .attr("fill", "none")
            .attr("d", d3.arc()({
            outerRadius: this.outerRadius,
            innerRadius: this.innerRadius,
            startAngle: 0,
            endAngle: 2 * Math.PI
        }));
        this.ribbon = d3.ribbonArrow()
            .radius(this.innerRadius - 0.5)
            .padAngle(1 / this.innerRadius);
        this.arc = d3.arc()
            .innerRadius(this.innerRadius)
            .outerRadius(this.outerRadius);
        (_a = this.chartConfig.eventHandler) === null || _a === void 0 ? void 0 : _a.addEventHandler((ev, ch) => {
            switch (ev) {
                case "hover":
                    this.ctx.selectAll(`.chord-to-${ch}`)
                        .classed("highlight", true);
                    break;
                case "unhover":
                    this.ctx.selectAll(`.chord-to-${ch}`)
                        .classed("highlight", false);
                    break;
            }
        });
        this.render();
    }
    render() {
        const objectSet = new Set();
        for (const { from, to } of this.data) {
            objectSet.add(from);
            objectSet.add(to);
        }
        const objects = [...objectSet];
        const matrix = new Array(objects.length)
            .fill(undefined)
            .map(() => new Array(objects.length).fill(0));
        for (const conn of this.data) {
            const fromIndex = objects.indexOf(conn.from);
            const toIndex = objects.indexOf(conn.to);
            matrix[fromIndex][toIndex] += conn.value;
        }
        const chords = this.chord(matrix);
        const chordSel = this.ctx.selectAll(".chord").data(chords).join("path")
            .attr("class", (d) => `chord chord-from-${objects[d.source.index]} chord-to-${objects[d.target.index]}`)
            .attr("d", this.ribbon)
            .attr("fill", d => this.chartConfig.colorMap[objects[d.target.index]])
            .style("mix-blend-mode", "multiply");
        enableTooltip(chordSel, (d) => `${objects[d.source.index]} mentions ${objects[d.target.index]} ${d.target.value} times`);
        const groups = this.ctx.selectAll(".chord-group").data(chords.groups).join("g")
            .attr("class", "chord-group")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .html((d) => `
                <path d="${this.arc(d)}" fill="${this.chartConfig.colorMap[objects[d.index]]}" stroke="white"/>
                <text dy="-3">
                    <textPath
                        xlink:href="#chord-text-path"
                        startOffset="${(d.startAngle + d.endAngle) / 2 * this.outerRadius - objects[d.index].length * 2.5}"
                    >
                        ${objects[d.index]}
                    </textPath>
                </text>
            `)
            .on("mouseover", (_, d) => { var _a; return (_a = this.chartConfig.eventHandler) === null || _a === void 0 ? void 0 : _a.emit("hover", objects[d.index]); })
            .on("mouseout", (_, d) => { var _a; return (_a = this.chartConfig.eventHandler) === null || _a === void 0 ? void 0 : _a.emit("unhover", objects[d.index]); });
        enableTooltip(groups, (d) => {
            const mentions = this.data.filter((v) => v.to === objects[d.index]).reduce((acc, val) => acc + val.value, 0);
            return `${objects[d.index]} is mentioned ${mentions} times`;
        });
    }
}
//# sourceMappingURL=DirectedChord.js.map