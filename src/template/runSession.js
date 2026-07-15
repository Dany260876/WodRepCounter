import { $ } from 'jquery'
import htmlContent from './runSession.html?raw'
import iconEndSession from '../assets/trophy.svg?raw'
import eventService from '../service/eventService';

export default class runSession {
    constructor(service) {
        this.sessionService = service;
        this.indexWorkout = 0;
        this.indexItem = 0;
        this.workoutRepNumber = 1;
        this.currentWorkout = null;
        this.currentItem = null;
    }
    render() {
        this.initPage();
        this.initEvents();
    }
    initPage() {
        $('#divRunSession').html(htmlContent);
        $('#divRunSession').show();
        this.showCurrentStep();
    }
    initEvents() {
        eventService.eventClick('#btnRunSessionStepOK', () => {
            if (this.setNextStep()) 
                this.showCurrentStep();
            else 
                this.endWorkout();
        });
    }
    showCurrentStep() {        
        // get current workout & current action item
        this.currentWorkout = this.sessionService.getWorkout(this.indexWorkout);
        if (this.currentWorkout==null) return;
        this.currentItem = this.currentWorkout.getItem(this.indexItem);
        if (this.currentItem==null) return;

        // init workout fields value
        let spanWorkoutName = $('#runSessionContent').find('#spanWorkoutName');
        spanWorkoutName.text(this.currentWorkout.getName());
        let spanWorkoutMaxReps = $('#runSessionContent').find('#spanWorkoutMaxReps');
        spanWorkoutMaxReps.text(this.currentWorkout.reps);
        let spanCurrentWorkoutRep = $('#runSessionContent').find('#spanCurrentWorkoutRep');
        spanCurrentWorkoutRep.text(this.workoutRepNumber);

        // init action fields value
        let valUnit = this.sessionService.getItemValueAndUnit(this.currentItem);
        let spanActionName = $('#runSessionContent').find('#spanActionName');
        spanActionName.html(valUnit.icon + ' ' + this.currentItem.getName());
        let spanActionReps = $('#runSessionContent').find('#spanActionReps');
        spanActionReps.text(valUnit.value);
        let spanActionUnit = $('#runSessionContent').find('#spanActionUnit');
        spanActionUnit.text(valUnit.unit);

        // init next action field
        let spanNextActionName = $('#runSessionContent').find('#spanNextActionName');
        let spanNextActionReps = $('#runSessionContent').find('#spanNextActionReps');
        let spanNextActionUnit = $('#runSessionContent').find('#spanNextActionUnit');
        let spanNextIcon = $('#runSessionContent').find('#spanNextIcon');
        let nextItem = this.getNextItem();
        if (nextItem!=null) {
            spanNextActionName.text(nextItem.getName());
            let valUnitNext = this.sessionService.getItemValueAndUnit(nextItem);
            spanNextActionReps.text(valUnitNext.value);
            spanNextActionUnit.text(valUnitNext.unit);
            spanNextIcon.html(valUnitNext.icon);
        }
        else {
            $('.pNextAction').html('&#127942; End of session');
        }

        // Start Counter for pause
        if (this.currentItem.type.toUpperCase()=='PAUSE') {
            this.startTimer(valUnit.value);
        }
    }
    startTimer(seconds) {
        $('#btnRunSessionStepOK').text('Wait...');
        $('#btnRunSessionStepOK').attr('disabled','disabled');
        let val = seconds;
        this.timerPause = window.setInterval(() => {
            val--;
            $('#spanActionReps').text(val);
            if (val==0) {
                $('#btnRunSessionStepOK').text('OK');
                $('#btnRunSessionStepOK').removeAttr('disabled');
                window.clearInterval(this.timerPause);
            }
        }, 1000);
    }
    getNextItem() {
        let result = this.currentWorkout.getItem(this.indexItem+1);
        if (result==null) {
            if (this.workoutRepNumber<this.currentWorkout.reps) {
                // return 1st item (loop)
                return this.currentWorkout.getItem(0);
            } 
            else {
                // return 1st item of next workout
                let nextWorkout = this.sessionService.getWorkout(this.indexWorkout+1);
                if (nextWorkout!=null) {
                    return nextWorkout.getItem(0); // 1st item of next workout
                }
                return null; // no next item
            }
        }
        return result;
    }
    setNextStep() {
        if (this.currentWorkout==null) return false;        
        // get next item
        this.indexItem++;
        this.currentItem = this.currentWorkout.getItem(this.indexItem);
        // if no item (end of workout), restart or change workout
        if (this.currentItem==null) {
            this.indexItem = -1;
            if (this.workoutRepNumber>=this.currentWorkout.reps) {
                this.indexWorkout++;
                this.workoutRepNumber = 1;
                this.currentWorkout = this.sessionService.getWorkout(this.indexWorkout);   
            }
            else {
                this.workoutRepNumber++;
            }
        }
        else {
            return true;
        }
        return this.setNextStep();
    }
    endWorkout() {
        $('#divRunSession').hide();
        console.log('end !');
    }
}