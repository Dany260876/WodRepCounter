export default class item {
    constructor(type, name) {
        this.type = type;
        this.name = name;
    }
    getName() {
        if (this.name=='') return '';
        return this.name[0].toUpperCase() + this.name.substr(1);
    }
}