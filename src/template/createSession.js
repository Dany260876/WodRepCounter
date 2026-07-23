import { $ } from 'jquery';

import saveIconContent from '../assets/save.svg?raw';
import loadIconContent from '../assets/load.svg?raw';
import chartIconContent from '../assets/chart-bar.svg?raw';
import settingsIconContent from '../assets/settings.svg?raw';
import deleteIconContent from '../assets/circle-x.svg?raw';
import alertIcon from '../assets/alert.svg?raw';

import htmlContent from './createSession.html?raw';
import htmlBlankWorkout from './component/blankWorkout.html?raw';
import htmlNewAction from './component/newAction.html?raw';
import htmlDlgSaveSession from './component/dialogSaveSession.html?raw';
import htmlDlgConfiguration from './component/dialogConfig.html?raw';

import sessionService from '../service/sessionService';
import eventService from '../service/eventService';
import settingsService from '../service/settingsService';
import historyService from '../service/historyService';

import runSession from './runSession';
import historySession from './historySession';

export default class createSession {
    constructor() {}
    render() {
        this.initPage();
    }
    initPage() {
        $('#divCreateSession').html(htmlContent);
        $('#divCreateSession').removeClass('hidden');
        $('#divCreateSession').addClass('visible');
        $('.btn-save').html(saveIconContent);
        $('.btn-load').html(loadIconContent);
        $('.btn-history').html(chartIconContent);
        $('.btn-settings').html(settingsIconContent);
        $('#divWorkoutList').data('session-name', '');
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
        eventService.eventClick('.btn-history', () => this.showHistory());
        eventService.eventClick('.btn-settings', () => this.showSettings());
        eventService.eventChange('.selActionType', () => this.changeActionType());
    }
    getWorkoutHtml(workout) {
        let name = 'workout name';
        let value = '5';
        if (workout) {
            name = workout.name;
            value = workout.reps;
        }
        const values = {
            '[WORKOUT_NAME]': name,
            '[WORKOUT_VALUE]': value
        };
        return htmlBlankWorkout.replace(/\[(WORKOUT_NAME|WORKOUT_VALUE)\]/g, 
            matched => values[matched]
        );
    }
    addNewWorkout() {
        $('.detWorkout').removeAttr('open');
        $('#divWorkoutList').append(this.getWorkoutHtml(null));
        $('.spanDeleteWorkout').html(deleteIconContent);
        this.initEvents();
        this.setObjectsId();
    }
    getNewActionHtml(action) {
        // defaults values
        let name = 'name';
        let value = 10;
        let unit = "reps";
        let selectedAction='selected';
        let selectedPause='';

        // values from action
        if (action) {
            name = action.name;
            if (action.duration) {
                value = action.duration;
                unit = "seconds";
                selectedAction = '';
                selectedPause = 'selected';
            }
            if (action.reps) { 
                value = action.reps;
            }                
        }

        // Build content
        const values = {
            '[NAME]': name,
            '[VALUE]': value,
            '[UNIT]': unit,
            '[SELECTEDACTION]': selectedAction,
            '[SELECTEDPAUSE]': selectedPause,
            '[DELETEICONCONTENT]': deleteIconContent
        };
        return htmlNewAction.replace(/\[(NAME|VALUE|UNIT|SELECTEDACTION|SELECTEDPAUSE|DELETEICONCONTENT)\]/g, 
            matched => values[matched]
        );
    }
    addNewAction() {
        let btn = event.currentTarget;
        let tableActions = $(btn).siblings('.tblActionsList')[0];
        $(tableActions).append(this.getNewActionHtml(null));
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
        service.session.name = $('#divWorkoutList').data('session-name');
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
            html = htmlDlgSaveSession;
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
    restoreSession(name) {
        const res = $.Deferred();
        
        sessionService.getSavedSessionByName(name).done((session) => {
            if (session!=null) {
                $('#divWorkoutList').html(''); // reset htmlContent
               
                // build new content
                $('#divWorkoutList').data('session-name', session.name);
                session.workoutList.forEach((obj) => {
                    // Add blank workout
                    $('.detWorkout').removeAttr('open');
                    $('#divWorkoutList').append(this.getWorkoutHtml(obj));
                    // Set workout values
                    let workout = $('#divWorkoutList .detWorkout:last-child');
                    let tableActions = workout.find('.tblActionsList');
                    // Add actions
                    obj.items.forEach((item) => {
                        let html = this.getNewActionHtml(item);
                        tableActions.append(html);
                    });
                });

                // init icons
                $('.spanDeleteWorkout').html(deleteIconContent);
                
                // init events & object ids
                this.initEvents();
                this.setObjectsId();
            }
            res.resolve();
        });
        
        return res;
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
                    html += "<td class='tdItemSelector'><input type='radio' name='sessionSelect' value='" + objSession.name + "'" + checked + "/></td>";
                    html += "<td class='tdItemText'><span class='listItemText'>" + objSession.name + "</span><br/><span class='listItemTextSmall'>" + objSession.workoutList.length + " Workouts / " + exQty + " Exercices</span></td>";
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

                eventService.eventClick('#btnDialogLoadSession', (e) => {
                    let elts = $('.tblItemsList').find('.tdItemSelector');
                    let selectedValue = '';
                    elts.each((i,obj) => { 
                        let radio = $(obj).find('input');
                        if ($(radio).prop('checked')) {
                            selectedValue = $(radio).val();
                            return false;
                        }
                    });
                    if (selectedValue!='') {
                        this.restoreSession(selectedValue).always(() => {
                            $('#dlgCreationDialog')[0].close();
                        });
                    }
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
            this.hide();   
            let runSessionPage = new runSession(service);
            runSessionPage.render();
        }
        else {
            let html = alertIcon + " ERROR <br/>" + errors;
            $('#spanCreationDialogMessage').html(html);
            $('#dlgCreationDialog')[0].showModal();
        }
    }
    showHistory() {
        // Hide current page and render history
        this.hide();
        new historySession().render();
    }
    hide() {
        $('#divCreateSession').html('');
        $('#divCreateSession').removeClass('visible');
        $('#divCreateSession').addClass('hidden');
    }
    showSettings() {
        settingsService.getSettings().always((settings) => {
            $('#spanCreationDialogMessage').html(htmlDlgConfiguration);
            $("#chkSettingsSounds")[0].checked = settingsService.getValue('soundsOn', settings);
            eventService.eventClick('#chkSettingsSounds', (e) => {
                let val = e.currentTarget.checked;
                settingsService.saveSettings("soundsOn",val,settings);
            });
            eventService.eventClick('#btnSettingsClearHistory', (e) => {
                historyService.clearHistory().always(() => {
                    $('#dlgCreationDialog')[0].close();
                });
            });
            $('#dlgCreationDialog')[0].showModal();
        });
    }
}
