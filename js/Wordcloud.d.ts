declare class Wordmap {
    private config;
    private data;
    private repeat_words;
    private rotate;
    private fontFamily;
    private fontScale;
    private padding;
    private colors;
    private width;
    private height;
    private svg;
    private chart;
    constructor(_config: {
        title: string;
        parentElement: string;
        containerWidth?: number;
        containerHeight?: number;
        margin?: {
            top: number;
            bottom: number;
            right: number;
            left: number;
        };
    }, _data: any[]);
    private initVis;
    renderVis(data: any): void;
    updateVis(data: any[]): void;
}
//# sourceMappingURL=Wordcloud.d.ts.map