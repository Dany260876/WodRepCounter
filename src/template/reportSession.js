import { $ } from 'jquery';
import htmlContent from './reportSession.html?raw';
import formattingService from '../service/formattingService';
import eventService from '../service/eventService';
import historyService from '../service/historyService';
import sessionService from '../service/sessionService';
import createSession from './createSession';
import historySession from './historySession';

export default class reportSession {
    constructor(session, previewOnly) {
        this.session = session;
        this.previewOnly = previewOnly;
    }
    render() {
        this.initPage();
        this.initEvents();
    }
    initPage() {
        $('#divReportSession').html(this.getReportContent());
        $('#divReportSession').removeClass('hidden');
        $('#divReportSession').addClass('visible');
        if (!this.previewOnly==true) this.addSessionToHistory();
    }
    initEvents() {
        eventService.eventClick('#btncloseReport', () => {
            this.hide();
            new createSession().render();
        });

        eventService.eventClick('#btnShowHistory', () => {
            this.hide();
            new historySession().render();
        });
    }
    hide() {
        $('#divReportSession').html('');
        $('#divReportSession').removeClass('visible');
        $('#divReportSession').addClass('hidden');
    }
    addSessionToHistory() {
        historyService.addSession(this.session);
    }
    getReportContent() {
        let html = htmlContent;
        let htmlActions = "";

        // Get stats
        let stats = sessionService.getSessionStats(this.session);
        if (stats.actionsDetail.size>0) {
            htmlActions += "<tr><td>Action</td><td>Total reps</td></tr>";
            stats.actionsDetail.forEach((data, name) => {
                htmlActions += "<tr class='trReportActionTitle' colspan=2><td>" + name + "</td></tr>";
                data.forEach((d) => {
                    htmlActions += "<tr>";
                    htmlActions += "<td>" + d.name + "</td>";
                    htmlActions += "<td>" + d.reps + "</td>";
                    htmlActions += "</tr>";
                });
            });
        }

        // build content
        const values = {
            '[SESSION_NAME]': this.session.name,
            '[SESSION_DATE]': formattingService.getDate(stats.date),
            '[SESSION_DURATION]': formattingService.getDurationSeconds(this.session.duration),
            '[SESSION_WORKOUTS]': stats.workouts,
            '[SESSION_ACTIONS]': stats.actions,
            '[SESSION_PAUSE]': formattingService.getDurationSeconds(stats.pause),
            '[ACTION_DETAILS]': htmlActions,
            '[SESSION_WDURATION]': formattingService.getDurationSeconds(this.session.duration-stats.pause)
        };
        return htmlContent.replace(/\[(SESSION_NAME|SESSION_DATE|SESSION_DURATION|SESSION_WORKOUTS|SESSION_ACTIONS|SESSION_PAUSE|ACTION_DETAILS|SESSION_WDURATION)\]/g, 
            matched => values[matched]
        );       
    }
}