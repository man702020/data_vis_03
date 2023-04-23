


type CharacterEvent = "hover" | "unhover";

type CharacterEventHandlerFn = (event: CharacterEvent, character: string) => void;



class CharacterEventHandler {
    private readonly listeners: CharacterEventHandlerFn[] = [];



    public addEventHandler(listenerFn: CharacterEventHandlerFn) {
        this.listeners.push(listenerFn);
    }
    public removeEventHandler(listenerFn: CharacterEventHandlerFn) {
        const index = this.listeners.indexOf(listenerFn);
        if(index >= 0) {
            this.listeners.splice(index, 1);
        }
    }

    public emit(event: CharacterEvent, character: string) {
        this.listeners.forEach((l) => l(event, character));
    }
}
