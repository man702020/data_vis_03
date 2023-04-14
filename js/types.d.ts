interface TranscriptLine {
    speaker: string;
    text: string;
}
interface KorraEpisode {
    abs_episode: number;
    season: number;
    episode: number;
    title: string;
    transcript_url: string;
    transcript: TranscriptLine[];
}
interface Margin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
interface DrawConfig {
    parent: string;
    width: number;
    height: number;
    margin?: Margin;
    className?: string;
}
interface Point2D {
    x: number;
    y: number;
}
//# sourceMappingURL=types.d.ts.map