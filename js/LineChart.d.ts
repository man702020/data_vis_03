interface LineConfig extends XYChartConfig<Point2D, number, number> {
    xScale?: "linear" | "log";
    yScale?: "linear" | "log";
    tooltipFn?: (d: Point2D & {
        series: Series;
    }) => string;
}
declare class LineChart<T> extends AbstractXYChart<T, Point2D, "x", "y", LineConfig> {
    protected xScale: d3.ScaleContinuousNumeric<number, number, never>;
    protected yScale: d3.ScaleContinuousNumeric<number, number, never>;
    protected xAxis: d3.Axis<number>;
    protected yAxis: d3.Axis<number>;
    setData(sourceData: T[]): void;
    constructor(rawData: T[], dataMapper: DataMapperFn<T, Point2D>, lineConfig: LineConfig, drawConfig: DrawConfig);
    render(): void;
}
interface Series {
    label: string;
    values: Point2D[];
    color?: string;
    bold?: boolean;
}
interface MultiLineConfig extends ChartConfig<Series> {
    xAxisLabel: string;
    xTickFormat?: (d: number) => string;
    yAxisLabel: string;
    yTickFormat?: (d: number) => string;
    tooltipFn?: (d: Point2D & {
        series: Series;
    }) => string;
    colorScheme?: readonly string[];
    eventHandler?: CharacterEventHandler;
    xScale?: "linear" | "log";
    yScale?: "linear" | "log";
}
declare function getSeriesDomain(s: Series): [[number, number], [number, number]];
declare function getMultiSeriesDomain(data: Series[]): [[number, number], [number, number]];
declare class MultiLineChart<T> extends AbstractChart<T, Series, MultiLineConfig> {
    protected xScale: d3.ScaleContinuousNumeric<number, number, never>;
    protected yScale: d3.ScaleContinuousNumeric<number, number, never>;
    protected xAxis: d3.Axis<number>;
    protected yAxis: d3.Axis<number>;
    protected labels: string[];
    protected legend: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    setData(sourceData: T[]): void;
    constructor(rawData: T[], dataMapper: DataMapperFn<T, Series>, lineConfig: MultiLineConfig, drawConfig: DrawConfig);
    protected renderAxes(xWrapWidth?: number): void;
    render(): void;
}
//# sourceMappingURL=LineChart.d.ts.map