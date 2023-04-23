type CharacterEvent = "hover" | "unhover";
type CharacterEventHandlerFn = (event: CharacterEvent, character: string) => void;
declare class CharacterEventHandler {
    private readonly listeners;
    addEventHandler(listenerFn: CharacterEventHandlerFn): void;
    removeEventHandler(listenerFn: CharacterEventHandlerFn): void;
    emit(event: CharacterEvent, character: string): void;
}
//# sourceMappingURL=EventHandler.d.ts.map