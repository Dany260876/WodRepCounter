import { $ } from 'jquery';

import saveIconContent from '../assets/save.svg?raw';
import loadIconContent from '../assets/load.svg?raw';
import settingsIconContent from '../assets/settings.svg?raw';
import deleteIconContent from '../assets/circle-x.svg?raw';
import alertIcon from '../assets/alert.svg?raw';

import htmlContent from './createSession.html?raw';
import htmlBlankWorkout from './blankWorkout.html?raw';

import sessionService from '../service/sessionService';
import eventService from '../service/eventService';

import runSession from './runSession';

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
        eventService.eventClick('#btnAddWorkout', () => this.addNewWorkout());
        eventService.eventClick('#btnStartSession', () => this.startSession());
        eventService.eventClick('#btnCreationDialogOK', () => $('#dlgCreationDialog')[0].close());
        eventService.eventClick('#btnDialogOK', () => $('#mainDialog')[0].close());
        eventService.eventClick('.btnAddAction', () => this.addNewAction());
        eventService.eventClick('.spanDeleteAction', () => this.deleteAction());
        eventService.eventClick('.spanDeleteWorkout', () => this.deleteWorkout());
        eventService.eventClick('.btn-save', () => this.saveSession());
        eventService.eventClick('.btn-load', () => this.loadSession());
        eventService.eventChange('.selActionType', () => this.changeActionType());
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
            html = "Current session can't be saved (" + errors + ")";
        }
        $('#spanDialogContent').html(html);

        eventService.eventClick('#btnDialogSaveSession', () => {
            let name = $('#txtSaveSessionName').val();
            service.saveSession(name).always((msg) => $('#spanDialogContent').html(msg));
        });
        
        $('#mainDialog')[0].showModal();
    }
    loadSession() {
        sessionService.getSavedSessions().done((sessions) => {
            if (sessions.length>0) {
                let html = "<table class='tblItemsList'>";
                let checked = " checked";
                sessions.forEach((objSession, i) => {
                    let exQty = 0;
                    objSession.workoutList.forEach((w) => exQty+=w.items.length);
                    html += "<tr class='listItemRow'>";
                    html += "<td><input type='radio' name='sessionSelect' value='" + objSession.name + "'" + checked + "/></td>";
                    html += "<td>" + objSession.name + " (" + objSession.workoutList.length + " Workouts / " + exQty + " Exercices)</td>";
                    html += "<td><span class='spanDeleteSavedSession' data-id='" + objSession.name + "'>" + deleteIconContent + "</span></td>";
                    html += "</tr>";
                    checked = "";
                });
                html += "</table>";
                html += "<br/><button class='btnDialog' id='btnDialogLoadSession'>Load session</button><hr/>";
                $('#spanCreationDialogMessage').html(html);

                eventService.eventClick('.spanDeleteSavedSession', (e) => {
                    let name = $(e.currentTarget).data('id');
                    sessionService.removeSavedSession(name)
                        .done(() => {
                            this.loadSession();
                        })
                        .fail((err) => console.log(err));
                });
                
                $('#dlgCreationDialog')[0].showModal();
            }
            else {
                $('#spanCreationDialogMessage').html("No saved session");
                $('#dlgCreationDialog')[0].showModal();
            }
        }).fail((err) => {
            $('#spanCreationDialogMessage').html(err);
            $('#dlgCreationDialog')[0].showModal();
        });
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