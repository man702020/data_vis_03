"use strict";
class CharacterEventHandler {
    constructor() {
        this.listeners = [];
    }
    addEventHandler(listenerFn) {
        this.listeners.push(listenerFn);
    }
    removeEventHandler(listenerFn) {
        const index = this.listeners.indexOf(listenerFn);
        if (index >= 0) {
            this.listeners.splice(index, 1);
        }
    }
    emit(event, character) {
        this.listeners.forEach((l) => l(event, character));
    }
}
//# sourceMappingURL=EventHandler.js.map