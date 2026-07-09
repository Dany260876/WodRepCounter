export default class workout {
    constructor(name, reps) {
        this.name = name;
        this.items = [];
        this.reps = reps;
    }
    addItem(item) {
        this.items.push(item);
    }
    getItem(index) {
        if ((index>=0) && (index<this.items.length))
            return this.items[index];
        return null;
    }
}