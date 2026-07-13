import { $ } from 'jquery'

import saveIconContent from '../assets/save.svg?raw';
import loadIconContent from '../assets/load.svg?raw';
import settingsIconContent from '../assets/settings.svg?raw';
import deleteIconContent from '../assets/circle-x.svg?raw';
import alertIcon from '../assets/alert.svg?raw';

import htmlContent from './createSession.html?raw'
import htmlBlankWorkout from './blankWorkout.html?raw'

import sessionService from '../service/sessionService'
import runSession from './runSession'

export default class createSession {
    constructor() {}
    render() {
        this.initPage();
    }
    initPage() {
        $('#divCreateSession').html(htmlContent);
        $('#divCreateSession').show();
        $('.btn-save').html(saveIconContent);
        $('.btn-load').html(loadIconContent);
        $('.btn-settings').html(settingsIconContent);
        this.addNewWorkout();
    }
    initEvents() {
        $('#btnCreationDialogOK').off("click");
        $('#btnCreationDialogOK').click(() => {
             $('#dlgCreationDialog')[0].close();
        });
        $('#btnAddWorkout').off("click");
        $('#btnAddWorkout').click(() => {
            this.addNewWorkout(); 
        });
        $('#btnStartSession').off("click");
        $('#btnStartSession').click(() => {
            this.startSession(); 
        });
        $('.btnAddAction').off("click");
        $('.btnAddAction').click(() => {
            this.addNewAction();
        });
        $('.selActionType').off("change");
        $('.selActionType').change(() => {
            this.changeActionType();
        });        
        $('.spanDeleteAction').off("click");
        $('.spanDeleteAction').click(() => {
            this.deleteAction();
        });
        $('.spanDeleteWorkout').off("click");
        $('.spanDeleteWorkout').click(() => {
            this.deleteWorkout();
        });
        $('.btn-save').off("click");
        $('.btn-save').click(() => {
            this.saveSession();
        });
        $('#btnDialogOK').off("click");
        $('#btnDialogOK').click(() => {
             $('#mainDialog')[0].close();
        });
    }
    addNewWorkout() {
        $('.detWorkout').removeAttr('open');
        $('#divWorkoutList').append(htmlBlankWorkout);
        $('.spanDeleteWorkout').html(deleteIconContent);
        this.initEvents();
        this.setObjectsId();
    }
    addNewAction() {
        let btn = event.currentTarget;
        let tableActions = $(btn).siblings('.tblActionsList')[0];
        let html = "<tr class='trAction'>";
        html += "<td class='tdType'>Type <select class='selActionType'><option value='ACTION'>&#9889; Action</option><option value='PAUSE'>&#128343; Pause</option></select></td>";
        html += "<td class='tdName'>Name <input class='txtActionName' type='text' value='name'></input></td>";
        html += "<td class='tdCount'>Count <input class='txtActionCount' type='number' value=10></input><span class='spanActionUnit'>reps</span></td>";
        html += "<td class='tdDelete'><span class='spanDeleteAction'>" + deleteIconContent + "</span></td>";
        html += "</tr>";
        $(tableActions).append(html);
        this.initEvents();
        this.setObjectsId();
    }
    changeActionType() {
        let selType = event.currentTarget;
        let trParent = $(selType).parents('.trAction');
        let spanUnite = $(trParent).find('.spanActionUnit');
        let tdName = $(trParent).find('.tdName');
        if (selType.value=='ACTION') {
            $(spanUnite).text('reps');
            $(tdName).show();
        }
        if (selType.value=='PAUSE') {
            $(spanUnite).text('seconds');
            $(tdName).hide();
        }
    }
    deleteAction() {
        let src = event.currentTarget;
        let trParent = $(src).parents('.trAction');
        $(trParent).remove();
    }
    deleteWorkout() {
        let src = event.currentTarget;
        let parent = $(src).parents('.detWorkout');
        $(parent).remove();
    }
    setObjectsId() {
        let id = new Date().getTime();
        $('input, select').each((i,obj) => { 
            if ($(obj).prop('id')=='') $(obj).prop('id', obj.type+'-'+id+'-'+i);
        });
    }
    buildSessionFromDOM(service) {
         // get data from DOM and build Session data
        let workouts = $('#divWorkoutList .detWorkout');
        workouts.each((i, elt) => {
            let workoutName = $(elt).find('.txtWorkoutName');
            let workoutReps = $(elt).find('.txtWorkoutReps');
            let workout = sessionService.createWorkout(workoutName.val(), workoutReps.val());
            let actionsList = $(elt).find('.tblActionsList .trAction');
            actionsList.each((i, elt) => {
                let actionType = $(elt).find('.selActionType');
                let actionName = $(elt).find('.txtActionName');
                let actionCount = $(elt).find('.txtActionCount');
                let action = sessionService.createAction(actionType.val(), actionName.val(), actionCount.val());
                workout.addItem(action);
            });
            service.addWorkout(workout);
        });
    }
    saveSession() {
        let html = "";
        let service = new sessionService();
        this.buildSessionFromDOM(service);
        let errors = service.sessionIsValid();
        if (errors==null) {
            html = "<p>Session name <input type='text' id='txtSaveSessionName'></input></p>";
            html += "<button class='btnDialog' id='btnDialogSaveSession'>Save session</button>";
            html += "<hr/>";
        }
        else {
            html = "Current session contains errors and can't be saved (" + errors + ")";
        }
        $('#spanDialogContent').html(html);
        $('#btnDialogSaveSession').off('click');
        $('#btnDialogSaveSession').click(() => {
            $('#spanDialogContent').html("Session saved.");
        });
        $('#mainDialog')[0].showModal();
    }
    startSession() {
        let service = new sessionService();
        this.buildSessionFromDOM(service);
        
        let errors = service.sessionIsValid();
        if (errors==null) {
            // Hide current page and render run session page
            $('#divCreateSession').hide();
            let runSessionPage = new runSession(service);
            runSessionPage.render();   
        }
        else {
            let html = alertIcon + " ERROR <br/>" + errors;
            $('#spanCreationDialogMessage').html(html);
            $('#dlgCreationDialog')[0].showModal();
        }
    }
}