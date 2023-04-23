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
    words: Record<string, number>;
}
interface KorraSeason {
    season: number;
    episodes: number;
}
interface LoadedData {
    episodes: KorraEpisode[];
    seasons: KorraSeason[];
}
interface KorraCharacterData {
    Name: string;
    Url: string;
    Image_Url?: string;
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