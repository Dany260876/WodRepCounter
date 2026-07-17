import { $ } from 'jquery'
import htmlContent from './reportSession.html?raw'

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
        $('#divReportSession').show();
    }
    initEvents() {
        
    }
    getReportContent() {
        let html = htmlContent;

        let date = new Date(this.session.startDate);
        let workouts = 0;
        let actions = 0;
        let pause = 0;
        
        this.session.workoutList.forEach((workout) => {
            workouts++;
            workout.items.forEach((item) => {
                if (item.type=='ACTION') 
                    actions++;
                else
                    pause += item.duration;
            });
        });
        
        html = html.replaceAll("[SESSION_NAME]",this.session.name);
        html = html.replaceAll("[SESSION_DATE]", date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
        html = html.replaceAll("[SESSION_DURATION]",this.session.duration);
        html = html.replaceAll("[SESSION_WORKOUTS]", workouts);
        html = html.replaceAll("[SESSION_ACTIONS]", actions);
        html = html.replaceAll("[SESSION_PAUSE]", pause);
        
        return html;
    }
}