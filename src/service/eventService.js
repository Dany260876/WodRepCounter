import { $ } from 'jquery';

export default class eventService {
    constructor() {}
    static eventClick(target, handler) {
        $(target).off("click");
        $(target).click(handler);   
    }
    static eventChange(target, handler) {
        $(target).off("change");
        $(target).change(handler);   
    }
}