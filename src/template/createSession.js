import { $ } from 'jquery'
import htmlContent from './createSession.html?raw'
import htmlBlankWorkout from './blankWorkout.html?raw'

export default class createSession {
    constructor() {}
    render() {
        this.initPage();
        this.initEvents();
    }
    initPage() {
        $('#divCreateSession').html(htmlContent);
        this.addNewWorkout();
    }
    initEvents() {
        $('#btnAddWorkout').off("click");
        $('#btnAddWorkout').click(() => {
            this.addNewWorkout(); 
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
    }
    addNewWorkout() {
        $('#divWorkoutList').append(htmlBlankWorkout);
        this.initEvents();
        this.setObjectsId();
    }
    addNewAction() {
        let btn = event.currentTarget;
        let tableActions = $(btn).siblings('.tblActionsList')[0];
        let html = "<tr class='trAction'>";
        html += "<td class='tdType'>Type <select class='selActionType'><option value='ACTION'>Action</option><option value='PAUSE'>Pause</option></select></td>";
        html += "<td class='tdName'>Name <input class='txtActionName' type='text'></input></td>";
        html += "<td class='tdCount'>Count <input class='txtActionCount' type='number'></input><span class='spanActionUnit'>reps</span></td>";
        html += "<td class='tdDelete'><span class='spanDeleteAction'>&#10060;</span></td>";
        html += "</tr>";
        $(tableActions).append(html);
        this.initEvents();
        this.setObjectsId();
    }
    changeActionType() {
        let selType = event.currentTarget;
        let trParent = $(selType).parents('.trAction');
        let spanUnite = $(trParent).find('.spanActionUnit');
        if (selType.value=='ACTION') $(spanUnite).text('reps');
        if (selType.value=='PAUSE') $(spanUnite).text('seconds');
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
}