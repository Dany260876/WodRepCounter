import { $ } from 'jquery';
import htmlContent from './reportSession.html?raw';
import formattingService from '../service/formattingService';
import eventService from '../service/eventService';
import historyService from '../service/historyService';
import sessionService from '../service/sessionService';
import createSession from './createSession';
import historySession from './historySession';

export default class reportSession {
    constructor(session) {
        this.session = session;
    }
    render() {
        this.initPage();
        this.initEvents();
    }
    initPage() {
        $('#divReportSession').html(this.getReportContent());
        $('#divReportSession').removeClass('hidden');
        $('#divReportSession').addClass('visible');
        this.addSessionToHistory();
    }
    initEvents() {
        eventService.eventClick('#btncloseReport', () => {
            $('#divReportSession').html('');
            $('#divReportSession').removeClass('visible');
            $('#divReportSession').addClass('hidden');
            new createSession().render();
        });

        eventService.eventClick('#btnShowHistory', () => {
            $('#divReportSession').html('');
            $('#divReportSession').removeClass('visible');
            $('#divReportSession').addClass('hidden');
            new historySession().render();
        });
    }
    addSessionToHistory() {
        historyService.addSession(this.session);
    }
    getReportContent() {
        let html = htmlContent;
        let htmlActions = "";

        // Get stats
        let stats = sessionService.getSessionStats(this.session);
        if (stats.actionsDetail.length>0) {
            htmlActions += "<table class='tblReportActionsDetails'>";
            htmlActions += "<tr><td>Action</td><td>Total reps</td></tr>";
            stats.actionsDetail.forEach((d) => {
                htmlActions += "<tr>";
                htmlActions += "<td>" + d.name + "</td>";
                htmlActions += "<td>" + d.reps + "</td>";
                htmlActions += "</tr>";
            });
            htmlActions += "</table>";
        }

        // build content
        const values = {
            '[SESSION_NAME]': this.session.name,
            '[SESSION_DATE]': formattingService.getDate(stats.date),
            '[SESSION_DURATION]': formattingService.getDurationSeconds(this.session.duration),
            '[SESSION_WORKOUTS]': stats.workouts,
            '[SESSION_ACTIONS]': stats.actions,
            '[SESSION_PAUSE]': formattingService.getDurationSeconds(stats.pause),
            '[ACTION_DETAILS]': htmlActions
        };
        return htmlContent.replace(/\[(SESSION_NAME|SESSION_DATE|SESSION_DURATION|SESSION_WORKOUTS|SESSION_ACTIONS|SESSION_PAUSE|ACTION_DETAILS)\]/g, 
            matched => values[matched]
        );       
    }
}