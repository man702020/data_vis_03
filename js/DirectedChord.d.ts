interface TreeConfig extends VisualizationConfig<TreeData> {
    title?: string;
}
interface TreeData {
    from: string;
    to: string;
    value: number;
}
declare class DirectedChord<T> extends AbstractVisualization<T, TreeData, TreeConfig> {
    protected dataMapper: DataMapperFn<T, TreeData>;
    protected chartConfig: TreeConfig;
    protected drawConfig: DrawConfig;
    protected svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    protected ctx: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    protected margin: Margin;
    protected chord: d3.ChordLayout;
    protected textPath: d3.Selection<SVGPathElement, unknown, HTMLElement, unknown>;
    protected ribbon: d3.RibbonArrowGenerator<any, d3.Chord, d3.ChordSubgroup>;
    protected arc: d3.Arc<any, d3.ChordGroup>;
    readonly innerRadius: number;
    readonly outerRadius: number;
    protected colorScheme: string[];
    constructor(rawData: T[], dataMapper: DataMapperFn<T, TreeData>, chartConfig: TreeConfig, drawConfig: DrawConfig);
    render(): void;
}
//# sourceMappingURL=DirectedChord.d.ts.map