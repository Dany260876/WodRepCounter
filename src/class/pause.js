import item from './item'
    
export default class pause extends item {
    constructor(duration) {
        super('PAUSE', 'pause');
        this.duration = duration;
    }
}