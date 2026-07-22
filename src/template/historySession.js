import { $ } from 'jquery';
import htmlContent from './historySession.html?raw';
import eventService from '../service/eventService';
import historyService from '../service/historyService';
import formattingService from '../service/formattingService';
import sessionService from '../service/sessionService';
import createSession from './createSession';

export default class historySession {
    constructor() {}
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
            let html = "";
            html += "<div class='divListHistorySession'>";
            history.forEach((histo) => {
                let stats = sessionService.getSessionStats(histo);
                html += "<p>";
                html += "<span class='spanHistoTitle'>" + formattingService.getDate(histo.startDate) + " - " +  histo.name + "</span>";
                html += "<span class='spanHistoDetails'>" + stats.workouts + " workouts, " + stats.actions + " actions (duration " + formattingService.getDurationSeconds(histo.duration) + ")</span>";
                html += "</p>";
                console.log(stats);
            });
            html += "</div>";
            $("#divHistory").html(html);
            console.log(history);
            this.initEvents(); 
        });
    }
    initEvents() {
        eventService.eventClick('#btnCloseHistory', () => this.closeHistory());
    }
    closeHistory() {
        $('#divHistorySession').html('');
        $('#divHistorySession').removeClass('visible');
        $('#divHistorySession').addClass('hidden');
        new createSession().render();
    }
}
