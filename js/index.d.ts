declare function parseCharacter(row: d3.DSVRowString<string>): KorraCharacterData;
declare function isMatch(searchOnString: string, searchText: string): boolean;
type FilterFn = (d: KorraEpisode) => boolean | undefined | 0;
declare function visualizeData(data: KorraEpisode[], charData: KorraCharacterData[]): void;
//# sourceMappingURL=index.d.ts.map