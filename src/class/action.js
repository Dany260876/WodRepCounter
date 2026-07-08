import item from './item'
    
export default class action extends item {
    constructor(name, reps) {
        super('ACTION', name);
        this.reps = reps;
    }
}