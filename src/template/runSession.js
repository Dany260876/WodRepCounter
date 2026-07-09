import { $ } from 'jquery'
import htmlContent from './runSession.html?raw'

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
        $('#btnRunSessionStepOK').off('click');
        $('#btnRunSessionStepOK').click(() => {
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
        spanWorkoutName.text(this.currentWorkout.name);
        let spanWorkoutMaxReps = $('#runSessionContent').find('#spanWorkoutMaxReps');
        spanWorkoutMaxReps.text(this.currentWorkout.reps);
        let spanCurrentWorkoutRep = $('#runSessionContent').find('#spanCurrentWorkoutRep');
        spanCurrentWorkoutRep.text(this.workoutRepNumber);

        // init action fields value
        let spanActionName = $('#runSessionContent').find('#spanActionName');
        spanActionName.text(this.currentItem.name);
        let valUnit = this.getItemValueAndUnit(this.currentItem);
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
            spanNextActionName.text(nextItem.name);
            let valUnitNext = this.getItemValueAndUnit(nextItem);
            spanNextActionReps.text(valUnitNext.value);
            spanNextActionUnit.text(valUnitNext.unit);
            spanNextIcon.html(valUnitNext.icon);
        }
        else {
            $('.pNextAction').html('&#127942; End of session');
        }
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
    getItemValueAndUnit(item) {
        let result = {};
        if (item.type=='ACTION') {
            result.value = item.reps;
            result.unit = 'reps';
            result.icon = '&#9889;';
        }
        if (item.type=='PAUSE') {
            result.value = item.duration;
            result.unit = 'seconds';
            result.icon = '&#8987;';
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