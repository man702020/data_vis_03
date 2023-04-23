declare function parseCharacter(row: d3.DSVRowString<string>): KorraCharacterData;
declare function isMatch(searchOnString: string, searchText: string): boolean;
type FilterFn = (d: KorraEpisode) => boolean | undefined | 0;
declare const SEASON_COLORS: string[];
declare const EPISODE_COLOR_MAP: any[];
declare const CHARACTER_COLOR_MAP: Record<string, string>;
declare const IMPORTANT_CHARACTERS: string[];
declare const filterBtnIds: string[];
declare function visualizeData(data: KorraEpisode[], charData: KorraCharacterData[]): void;
//# sourceMappingURL=index.d.ts.map