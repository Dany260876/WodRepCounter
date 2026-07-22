export default class formattingService {
    constructor() {}
    static getDate(date) {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    static getDurationSeconds(seconds) {
        let remainder = seconds%60;
        let minutes = Math.floor(seconds/60);
        if (minutes<1) {
            if (seconds>=10) 
                return '0:' + Math.floor(seconds);
            else
                return '0:0' + Math.floor(seconds);
        }
        else {
            return minutes + ':' + remainder;
        }
    }
}