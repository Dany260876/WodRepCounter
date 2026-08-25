import $ from 'jquery';
import LZString from 'lz-string';

import saveIconContent from '../assets/save.svg?raw';
import loadIconContent from '../assets/load.svg?raw';
import chartIconContent from '../assets/chart-bar.svg?raw';
import settingsIconContent from '../assets/settings.svg?raw';
import deleteIconContent from '../assets/circle-x.svg?raw';
import alertIcon from '../assets/alert.svg?raw';
import fileIcon from '../assets/file.svg?raw';
import menuIcon from '../assets/menu.svg?raw';

import htmlContent from './createSession.html?raw';
import htmlBlankWorkout from './component/blankWorkout.html?raw';
import htmlNewAction from './component/newAction.html?raw';
import htmlDlgSaveSession from './component/dialogSaveSession.html?raw';
import htmlDlgConfiguration from './component/dialogConfig.html?raw';
import htmlStartupPage from './component/startupPage.html?raw';

import sessionService from '../service/sessionService';
import eventService from '../service/eventService';
import settingsService from '../service/settingsService';
import historyService from '../service/historyService';

import runSession from './runSession';
import historySession from './historySession';

export default class createSession {
    constructor() {}
    render() {
        sessionService.getActionKeywords().done((words) => {
            this.actionKeywords = words;
            this.initPage();
            this.showStartUpPage();
        });
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
        this.initEvents();
        this.setObjectsId();
    }
    initEvents() {
        eventService.eventClick('#btnAddWorkout', () => this.addNewWorkout());
        eventService.eventClick('#btnStartSession', () => this.startSession());
        eventService.eventClick('#btnCreationDialogOK', () => $('#dlgCreationDialog')[0].close());
        eventService.eventClick('#btnDialogOK', () => $('#mainDialog')[0].close());
        eventService.eventClick('.btnAddAction', () => this.addNewAction());
        eventService.eventClick('.spanDeleteAction', () => this.deleteAction());
        eventService.eventClick('.spanDeleteWorkout', () => this.deleteWorkout());
        eventService.eventClick('.spanMenuAction', () => this.showActionMenu());
        eventService.eventClick('.btn-save', () => this.saveSession());
        eventService.eventClick('.btn-load', () => this.loadSession());
        eventService.eventClick('.btn-history', () => this.showHistory());
        eventService.eventClick('.btn-settings', () => this.showSettings());
        eventService.eventChange('.selActionType', () => this.changeActionType());
        eventService.eventFocus('.txtActionName', (e) => this.clearTextField(e));
        eventService.eventFocus('.txtWorkoutName', (e) => this.clearTextField(e));
        eventService.eventClick(window, () => this.hideActionMenu());
    }
    showStartUpPage() {
        let startupDisplayed = window.sessionStorage.getItem('startupDisplayed');
        if (startupDisplayed == 'yes') return;
        window.sessionStorage.setItem('startupDisplayed', 'yes');

        let html = "";
        html += "<div id='divStartupPage'>";
        html += htmlStartupPage.replace('[IMPORT_ICON]', loadIconContent);
        html += "</div>";
        $('#spanDialogContent').html(html);
        $('#mainDialog')[0].showModal();
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
    clearTextField(e) {
        let value = $(e.currentTarget).val();
        if ((value=='name') || (value=='workout name')) $(e.currentTarget).val('');
    }
    addNewWorkout() {
        $('#divStartupPage').remove();
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
            '[DELETEICONCONTENT]': deleteIconContent,
            '[MENUICONCONTENT]': menuIcon
        };
        return htmlNewAction.replace(/\[(NAME|VALUE|UNIT|SELECTEDACTION|SELECTEDPAUSE|DELETEICONCONTENT|MENUICONCONTENT)\]/g, 
            matched => values[matched]
        );
    }
    hideActionMenu() {
        if ($(".divActionKeywords").css('display')!='none') {
            $(".divActionKeywords").html('');
            $(".divActionKeywords").removeClass('visible');
            $(".divActionKeywords").addClass('hidden');
        }
    }
    showActionMenu() {
        let btn = event.currentTarget;

        if (($(".divActionKeywords").css('display')=='none') && (this.actionKeywords.size>0)) {
            let textControle = $(btn).siblings('.txtActionName')[0];
            let html = "";

            let currentVal = $(textControle).val();
            if (currentVal=='name') {
                $(textControle).val('');
                currentVal='';
            }

            html += "<ul class='ulKeywordsList'>";
            this.actionKeywords.values().forEach((val) => {
                if (val.toUpperCase().startsWith(currentVal.toUpperCase()))
                    html += "<li class='liKeywordsItem'>" + val + "</li>";
            });
            html += "</ul>";
            
            $(".divActionKeywords").html(html);

            let pos = $(textControle).position();
            let width = $(textControle).css('width');
            $(".divActionKeywords").css('left', pos.left);
            $(".divActionKeywords").css('top', pos.top+20);
            $(".divActionKeywords").css('width', width);
            $(".divActionKeywords").removeClass('hidden');
            $(".divActionKeywords").addClass('visible');

            eventService.eventClick('.liKeywordsItem', () => {
                let val = $(event.currentTarget).text();
                $(textControle).val(val);
                this.hideActionMenu();
            });
        }
        else {
            this.hideActionMenu();
        }

        event.stopPropagation();
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
        let txtActionName = $(tdName).find('.txtActionName');
        if (selType.value=='ACTION') {
            $(txtActionName).val('name');
            $(spanUnite).text('reps');
            $(tdName).show();
        }
        if (selType.value=='PAUSE') {
            $(txtActionName).val('pause');
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
            if ($(obj).prop('id')=='') $(obj).prop('id', obj.type + '-' + id + '-' + i);
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
            service.saveSession(name).always((msg) => {
                sessionService.getActionKeywords().done((words) => {
                    this.actionKeywords = words;
                    $('#spanDialogContent').html(msg);
                });
            });
        });
        
        $('#mainDialog')[0].showModal();
    }
    restoreSession(id) {
        const res = $.Deferred();
        
        sessionService.getSavedSessionById(id).done((session) => {
            if (session!=null) {
                $('#divStartupPage').remove();
                
                // set name
                let currentName = $('#divWorkoutList').data('session-name');
                if (currentName=='')
                    $('#divWorkoutList').data('session-name', session.name);
                else
                    $('#divWorkoutList').data('session-name', 'Session - ' + new Date().toLocaleDateString());

                // build new content
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
                sessions.sort((a,b) => { if (a.name>b.name) return 1; else return -1; }); // sort sessions by name                
                let html = "<table class='tblItemsList'>";
                let checked = " checked";
                sessions.forEach((objSession, i) => {
                    let exQty = 0;
                    objSession.workoutList.forEach((w) => exQty+=w.items.length);
                    html += "<tr class='listItemRow'>";
                    html += "<td class='tdItemSelector'><input type='radio' name='sessionSelect' value='" + objSession.id + "'" + checked + "/></td>";
                    html += "<td class='tdItemText'><span class='listItemText'>" + objSession.name + "</span><br/><span class='listItemTextSmall'>" + objSession.workoutList.length + " Workouts / " + exQty + " Exercices</span></td>";
                    html += "<td>";
                    html += "<span class='spanOpenSavedSession' data-id='" + objSession.id + "'>" + fileIcon + "</span>";
                    html += "</td>";
                    html += "</tr>";
                    checked = "";
                });
                html += "</table>";
                html += "<br/><button class='btnDialog' id='btnDialogLoadSession'>Load session</button><hr/>";
                $('#spanCreationDialogMessage').html(html);

                eventService.eventClick('#btnCreationDialogOK', () => $('#dlgCreationDialog')[0].close());
                
                eventService.eventClick('.spanOpenSavedSession', (e) => {
                    let id = $(e.currentTarget).data('id');
                    let index = sessions.findIndex((val) => val.id==id);
                    let currentSession = sessions[index];
                    this.buildSessionDetails(currentSession);
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
    buildSessionDetails(session) {
        let html = "<div id='divSessionDetails' data-session-id='" + session.id + "'>";
        html += "<div class='spanDeleteSavedSession' data-id='" + session.id + "'>" + deleteIconContent + "</div>";
        html += "<p><span class='spanSessionDetailsName'>" + session.name + "</span></p>";
        session.workoutList.forEach((workout) => {
            html += "<p><span class='spanSessionDetailsWorkoutName'>" + workout.name + "</span></p>";
            html += "<p><span class='spanSessionDetailsWorkoutReps'>" + workout.reps + "</span> reps</p>";
            html += "<p>";
            html += "<ul>";
            workout.items.forEach((item) => {
                let itemValues = sessionService.getItemValueAndUnit(item);
                html += "<li>";
                html += "<span class='spanSessionDetailsItemName'>" + item.name + "</span>";
                html += "<span class='spanSessionDetailsItemType'>" + itemValues.icon + "</span>";
                html += "<span class='spanSessionDetailsItemReps'>" + itemValues.value + " " + itemValues.unit + "</span>";
                html += "</li>";
            });
            html += "</ul>";
            html += "</p>";
        });
        html += "</div>";
        html += "<button class='btnDialog' id='btnDialogLoadSessionDetails'>Load session</button><hr/>";
        $('#spanCreationDialogMessage').html(html);

        eventService.eventClick('.spanDeleteSavedSession', (e) => {
            let id = $(e.currentTarget).data('id');
            sessionService.removeSavedSession(id)
                .done(() => {
                    this.loadSession();
                })
                .fail((err) => console.log(err));
        });
        
        eventService.eventClick('#btnCreationDialogOK', () => {
            this.loadSession();
        });
        
        eventService.eventClick('#btnDialogLoadSessionDetails', (e) => {
            let id = $("#divSessionDetails").data('session-id');
            this.restoreSession(id).always(() => {
                $('#dlgCreationDialog')[0].close();
            });
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
            eventService.eventClick('#btnSettingsExportSessions', () => {
                let resSession = sessionService.getSavedSessions();
                resSession.done((dataSession) => {
                    let stringData = LZString.compressToBase64(JSON.stringify(dataSession));
                    this.renderExportData(stringData, 'session');
                });
            });

            eventService.eventClick('#btnSettingsExportHistory', () => {
                let resHisto = historyService.getHistory();
                resHisto.done((dataHisto) => {
                    let stringData = LZString.compressToBase64(JSON.stringify(dataHisto));
                    this.renderExportData(stringData, 'histo');
                });
            });
            
            $('#dlgCreationDialog')[0].showModal();
        });
    }
    renderExportData(data, exportType) {
        let html = "";
        html += "<p><textarea id='txtImportExportData' rows='15' cols='35' data-export-type='" + exportType + "'>" + data + "</textarea></p>";
        html += "<p><button class='btnDialog' id='btnImportData'>Import</button></p><hr/>";       
        $('#spanCreationDialogMessage').html(html);
        eventService.eventClick('#btnImportData', () => {
            try {
                let val = $('#txtImportExportData').val();
                let exType = $('#txtImportExportData').data('export-type');
                let data = JSON.parse(LZString.decompressFromBase64(val));
                
                let res=null;
                if (exType=='session') res = sessionService.restoreSession(data); 
                if (exType=='histo') res = historyService.restoreHistory(data);

                res.done(() => {
                    $('#dlgCreationDialog')[0].close();
                });
            }
            catch(err) {
                $('#spanCreationDialogMessage').html("Error during import data (" + err + ")");
            }
        });
    }
}
