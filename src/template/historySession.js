import { $ } from 'jquery';
import htmlContent from './historySession.html?raw';
import eventService from '../service/eventService';
import historyService from '../service/historyService';
import formattingService from '../service/formattingService';
import sessionService from '../service/sessionService';
import createSession from './createSession';
import reportSession from './reportSession';

export default class historySession {
    constructor() {
        this.history=[];
    }
    render() {
        this.initPage();
    }
    initPage() {
        $('#divHistorySession').html(htmlContent);
        this.initHistory();
        $('#divHistorySession').removeClass('hidden');
        $('#divHistorySession').addClass('visible');
    }
    initHistory() {
        historyService.getHistory().done((history) => {
            this.history = history;
            let html = "";
            html += "<div class='divListHistorySession'>";
            history.forEach((histo) => {
                let stats = sessionService.getSessionStats(histo);
                html += "<p class='pSessionItem' data-histo-id='" + histo.id + "'>";
                html += "<span class='spanHistoTitle'>" + formattingService.getDate(histo.startDate) + " - " +  histo.name + "</span>";
                html += "<span class='spanHistoDetails'>" + stats.workouts + " workouts, " + stats.actions + " actions (duration " + formattingService.getDurationSeconds(histo.duration) + ")</span>";
                html += "</p>";
            });
            html += "</div>";
            $("#divHistory").html(html);
            this.initEvents(); 
        });
    }
    initEvents() {
        eventService.eventClick('#btnCloseHistory', () => this.closeHistory());
        eventService.eventClick('.pSessionItem', () => this.selectItem());
    }
    selectItem() {
        let histo = event.currentTarget;
        let id = $(histo).data('histo-id');
        let currentHisto = this.history.filter((h) => h.id==id);
        if (currentHisto.length>0) {
            this.hide();
            new reportSession(currentHisto[0]).render(); 
        }
    }
    closeHistory() {
        this.hide();
        new createSession().render();
    }
    hide() {
        $('#divHistorySession').html('');
        $('#divHistorySession').removeClass('visible');
        $('#divHistorySession').addClass('hidden');
    }
}
