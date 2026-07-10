export default class item {
    constructor(type, name) {
        this.type = type;
        this.name = name;
    }
    getName() {
        return this.name[0].toUpperCase()+this.name.substr(1);
    }
}