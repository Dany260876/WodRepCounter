import { $ } from 'jquery';
import htmlContent from './reportSession.html?raw';
import formattingService from '../service/formattingService';
import eventService from '../service/eventService';
import createSession from './createSession'

export default class reportSession {
    constructor(service) {
        this.session = service.session;
    }
    render() {
        this.initPage();
        this.initEvents();
    }
    initPage() {
        console.log(this.session);
        $('#divReportSession').html(this.getReportContent());
        $('#divReportSession').removeClass('hidden');
        $('#divReportSession').addClass('visible');
    }
    initEvents() {
        eventService.eventClick('#btncloseReport', () => {
            $('#divReportSession').html('');
            $('#divReportSession').removeClass('visible');
            $('#divReportSession').addClass('hidden');
            new createSession().render();
        });
    }
    getReportContent() {
        let html = htmlContent;
        
        let date = new Date(this.session.startDate);
        let workouts = 0;
        let actions = 0;
        let pause = 0;
        let actionsDetail = [];
        let htmlActions = "";
        
        this.session.workoutList.forEach((workout) => {
            workouts++;
            let wReps = workout.reps*1;
            workout.items.forEach((item) => {
                if (item.type=='ACTION') {
                    actionsDetail.push({
                        'name':item.name,
                        'reps':item.reps * wReps
                    });
                    actions++;
                }
                else {
                    pause += item.duration * wReps;
                }
            });
        });

        if (actionsDetail.length>0) {
            htmlActions += "<table class='tblReportActionsDetails'>";
            htmlActions += "<tr><td>Action</td><td>Total reps</td></tr>";
            actionsDetail.forEach((d) => {
                htmlActions += "<tr>";
                htmlActions += "<td>" + d.name + "</td>";
                htmlActions += "<td>" + d.reps + "</td>";
                htmlActions += "</tr>";
            });
            htmlActions += "</table>";            
        }
       
        html = html.replaceAll("[SESSION_NAME]", this.session.name);
        html = html.replaceAll("[SESSION_DATE]", formattingService.getDate(date));
        html = html.replaceAll("[SESSION_DURATION]", formattingService.getDurationSeconds(this.session.duration));
        html = html.replaceAll("[SESSION_WORKOUTS]", workouts);
        html = html.replaceAll("[SESSION_ACTIONS]", actions);
        html = html.replaceAll("[SESSION_PAUSE]", formattingService.getDurationSeconds(pause));
        html = html.replaceAll("[ACTION_DETAILS]", htmlActions);
        
        return html;
    }
}