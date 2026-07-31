import $ from 'jquery';

import AirDatepicker from 'air-datepicker';
import 'air-datepicker/air-datepicker.css';

import htmlContent from './historySession.html?raw';
import eventService from '../service/eventService';
import historyService from '../service/historyService';
import formattingService from '../service/formattingService';
import sessionService from '../service/sessionService';
import statisticsService from '../service/statisticsService';
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
                let stats = statisticsService.getSessionStats(histo);
                html += "<p class='pSessionItem' data-histo-id='" + histo.id + "'>";
                html += "<span class='spanHistoTitle'>" + formattingService.getDate(new Date(histo.startDate)) + " - " +  histo.name + "</span>";
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
        eventService.eventClick('#btnStatistics', () => this.showStats());
        eventService.eventClick('.pSessionItem', () => this.selectItem());
    }
    selectItem() {
        let histo = event.currentTarget;
        let id = $(histo).data('histo-id');
        let currentHisto = this.history.filter((h) => h.id==id);
        if (currentHisto.length>0) {
            this.hide();
            new reportSession(currentHisto[0], true).render(); 
        }
    }
    showStats() {
        statisticsService.getStatistics().done((stats) => {          
            let html = "";
            html += "<div class='divStatsGlobal'><span class='spanStatsTitle'>Global Statistics</span>";
            html += "<ul>";
            html += "<li>Total Workouts<span class='liStatResult'>" + stats.totalWorkouts + "</span></li>";
            html += "<li>Total Actions<span class='liStatResult'>" + stats.totalActions + "</span></li>";
            html += "<li>Total Duration<span class='liStatResult'>" + formattingService.getDurationSeconds(stats.totalDuration) + "</span></li>";
            html += "<li>Total Pause<span class='liStatResult'>" + formattingService.getDurationSeconds(stats.totalPause) + "</span></li>";
            html += "<li>Total Work<span class='liStatResult'>" + formattingService.getDurationSeconds(stats.totalWorkingTime) + "</span></li>";
            html += "</ul>";
            html += "</div>";
            
            html += "<div class='divStatsCalendar'><span class='spanStatsTitle'>Session days</span>";
            html += "<div id='divCalendar'></div>";
            html += "</div>";

            html += "<div class='divStatsTopActions'><span class='spanStatsTitle'>Top 10 Actions</span>";
            html += "<table>";
            html += "<tr><td class='tdStatsActionsHeader'>Action</td><td class='tdStatsActionsHeader'>Total reps</td></tr>";
            let cpt = 0;
            stats.actionsStats.forEach((aStat) => {
                if (cpt<10) html += "<tr><td>" + aStat[0] + "</td><td>" + aStat[1] + "</td></tr>";
                cpt++;
            });
            html += "</table>";
            html += "</div>";

            $("#divHistory").html(html);
            $(".spanHistoryTitle").text('Statistics');
            $('#btnStatistics').hide();

            // build calendar
            new AirDatepicker('#divCalendar', {
                locale: {
                    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                    months: ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
                    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    today: 'Today',
                    clear: 'Clear',
                    dateFormat: 'mm/dd/yyyy',
                    timeFormat: 'hh:ii aa',
                    firstDay: 0
                },
                inline: true,
                multipleDates: true,
                onBeforeSelect({date, datepicker}) {
                    historyService.getSessionByDate(date).done((session) => {
                        if (session) {
                            $('#divHistorySession').html('');
                            $('#divHistorySession').removeClass('visible');
                            $('#divHistorySession').addClass('hidden');
                            new reportSession(session, true).render(); 
                        }
                    });
                    return false;
                },
                onRenderCell({date, cellType}) {
                    let found = false;
                    stats.sessionDays.forEach((d) => {
                        if (!found) found = (d.toDateString() == date.toDateString());
                    });
                    if (found) {
                        return {
                            html: '&#127942',
                            classes: '-emoji-cell-'
                        };
                    }
                }
            });
            $(".air-datepicker").css('width','100%');

            this.initEvents();
        });
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
