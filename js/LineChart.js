"use strict";
class LineChart extends AbstractXYChart {
    setData(sourceData) {
        super.setData(sourceData);
        const xDomain = d3.extent(this.data, ({ x }) => x);
        const yDomain = d3.extent(this.data, ({ y }) => y);
        this.xScale = this.chartConfig.xScale === "log" ?
            d3.scaleLog(xDomain, [0, this.drawConfig.width]) :
            d3.scaleLinear(xDomain, [0, this.drawConfig.width]);
        this.yScale = this.chartConfig.xScale === "log" ?
            d3.scaleLog(yDomain, [this.drawConfig.height, 0]) :
            d3.scaleLinear(yDomain, [this.drawConfig.height, 0]);
        this.xAxis = d3.axisBottom(this.xScale);
        if (this.chartConfig.xTickFormat) {
            this.xAxis.tickFormat(this.chartConfig.xTickFormat);
        }
        this.yAxis = d3.axisLeft(this.yScale);
        if (this.chartConfig.yTickFormat) {
            this.yAxis.tickFormat(this.chartConfig.yTickFormat);
        }
        this.renderAxes();
    }
    constructor(rawData, dataMapper, lineConfig, drawConfig) {
        super(rawData, dataMapper, lineConfig, drawConfig);
        this.ctx.append("polyline")
            .attr("class", "line-plot-line");
        this.render();
    }
    render() {
        this.ctx.select(".line-plot-line")
            .attr("points", this.data.map(({ x, y }) => `${this.xScale(x)},${this.yScale(y)}`).join(" "))
            .attr("stroke", "#000")
            .attr("fill", "none");
    }
}
function getSeriesDomain(s) {
    let minX = s.values[0].x;
    let maxX = minX;
    let minY = s.values[0].y;
    let maxY = minY;
    for (const p of s.values.slice(1)) {
        if (p.x < minX) {
            minX = p.x;
        }
        else if (p.x > maxX) {
            maxX = p.x;
        }
        if (p.y < minY) {
            minY = p.y;
        }
        else if (p.y > maxY) {
            maxY = p.y;
        }
    }
    return [[minX, maxX], [minY, maxY]];
}
function getMultiSeriesDomain(data) {
    let [[minX, maxX], [minY, maxY]] = getSeriesDomain(data[0]);
    for (const s of data.slice(1)) {
        let [[newMinX, newMaxX], [newMinY, newMaxY]] = getSeriesDomain(s);
        if (newMinX < minX) {
            minX = newMinX;
        }
        if (newMaxX > maxX) {
            maxX = newMaxX;
        }
        if (newMinY < minY) {
            minY = newMinY;
        }
        if (newMaxY > maxY) {
            maxY = newMaxY;
        }
    }
    return [[minX, maxX], [minY, maxY]];
}
class MultiLineChart extends AbstractChart {
    setData(sourceData) {
        super.setData(sourceData);
        this.labels = this.data.map((d) => d.label);
        const [xDomain, yDomain] = getMultiSeriesDomain(this.data);
        this.xScale = this.chartConfig.xScale === "log" ?
            d3.scaleLog(xDomain, [0, this.drawConfig.width]) :
            d3.scaleLinear(xDomain, [0, this.drawConfig.width]);
        this.yScale = this.chartConfig.xScale === "log" ?
            d3.scaleLog(yDomain, [this.drawConfig.height, 0]) :
            d3.scaleLinear(yDomain, [this.drawConfig.height, 0]);
        this.xAxis = d3.axisBottom(this.xScale);
        if (this.chartConfig.xTickFormat) {
            this.xAxis.tickFormat(this.chartConfig.xTickFormat);
        }
        this.yAxis = d3.axisLeft(this.yScale);
        if (this.chartConfig.yTickFormat) {
            this.yAxis.tickFormat(this.chartConfig.yTickFormat);
        }
        this.renderAxes();
    }
    constructor(rawData, dataMapper, lineConfig, drawConfig) {
        super(rawData, dataMapper, lineConfig, drawConfig);
        this.legend = this.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${this.margin.left + this.drawConfig.width}, ${this.margin.top})`);
        this.legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.margin.right)
            .attr("height", 15 + this.data.length * 20)
            .attr("rx", 10)
            .attr("fill", "#fff")
            .attr("stroke", "#000");
        this.render();
    }
    renderAxes(xWrapWidth) {
        this.svg.selectAll(".x-axis,.x-label,.y-axis,.y-label").remove();
        const xAxisSel = this.ctx.append("g")
            .attr("class", "x-axis")
            .call(this.xAxis)
            .attr("transform", `translate(0, ${this.drawConfig.height})`);
        if (xWrapWidth !== undefined) {
            xAxisSel.selectAll(".tick text")
                .call(wrapAxisText, xWrapWidth);
        }
        this.svg.append("text")
            .attr("class", "x-label")
            .attr("text-anchor", "middle")
            .attr("x", this.margin.left + this.drawConfig.width / 2)
            .attr("y", this.margin.top + this.drawConfig.height + this.margin.bottom - 6)
            .text(this.chartConfig.xAxisLabel);
        this.ctx.append("g")
            .attr("class", "y-axis")
            .call(this.yAxis);
        this.svg.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "middle")
            .attr("x", 0 - this.margin.top - this.drawConfig.height / 2)
            .attr("y", 50)
            .attr("transform", "rotate(-90)")
            .text(this.chartConfig.yAxisLabel);
    }
    render() {
        this.ctx.selectAll(".line-plot-line").data(this.data).join("polyline")
            .attr("class", ({ label }) => `line-plot-line line-plot-line-${label}`)
            .attr("points", ({ values }) => values.map(({ x, y }) => `${this.xScale(x)},${this.yScale(y)}`).join(" "))
            .attr("stroke", (d) => d.color || "#000")
            .attr("fill", "none");
        this.legend.selectAll(".legend-entry").data(this.data).join("g")
            .attr("transform", (_, i) => `translate(5, ${5 + i * 20})`)
            .html((d) => `
                <line x1="0" y1="10" x2="16" y2="10" stroke="${d.color || "#000"}"/>
                <circle cx="8" cy="10" r="3" fill="${d.color || "#000"}"/>
                <text x="20" y="16" >${d.label}</text>
            `);
        this.ctx.selectAll(".line-plot-marker-layer").data(this.data).join("g")
            .attr("class", ({ label }) => `line-plot-marker-layer line-plot-marker-layer-${label}`)
            .selectAll("line-plot-marker").data((d) => d.values.map((p) => (Object.assign({ color: d.color }, p)))).join("circle")
            .attr("class", "line-plot-marker")
            .attr("cx", (d) => this.xScale(d.x))
            .attr("cy", (d) => this.yScale(d.y))
            .attr("r", 3)
            .attr("fill", (d) => d.color || "#000");
    }
}
//# sourceMappingURL=LineChart.js.map