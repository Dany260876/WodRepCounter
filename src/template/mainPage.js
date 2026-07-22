import { $ } from 'jquery'
import htmlMainPage from './mainPage.html?raw'
import createSession from './createSession'

export default class mainPage {
    constructor() {}
    render() {
        $('#app').html(htmlMainPage);
        new createSession().render();
    }
}
