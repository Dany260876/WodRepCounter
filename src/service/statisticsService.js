import $ from 'jquery';
import historyService from './historyService';

export default class statisticsService {
    constructor() {}
    static getSessionStats(session) {
        let result = {};

        result.duration = session.duration;
        result.date = new Date(session.startDate);
        result.workouts = 0;
        result.actions = 0;
        result.pause = 0;
        result.actionsDetail = new Map();
        
        session.workoutList.forEach((workout) => {
            result.workouts++;
            let wReps = workout.reps*1;
            let actionsStats = [];
            workout.items.forEach((item) => {
                if (item.type=='ACTION') {
                    actionsStats.push({
                        'name':item.name ,
                        'reps':item.reps * wReps
                    });
                    result.actions++;
                }
                else {
                    result.pause += item.duration * wReps;
                }
            });
            result.actionsDetail.set(workout.name, actionsStats);
        });

        return result;
    }
    static getStatistics() {
        const res = $.Deferred();
        historyService.getHistory().done((sessions) => {
            let result = {};
            result.totalDuration = 0;
            result.totalWorkingTime = 0;
            result.totalPause = 0;
            result.totalActions = 0;
            result.totalWorkouts = 0;

            // build stats
            let actionsStats = new Map();
            sessions.forEach((session) => {
                let sessionStats = statisticsService.getSessionStats(session); 
                result.totalDuration += sessionStats.duration;
                result.totalPause += sessionStats.pause;
                result.totalWorkingTime += sessionStats.duration - sessionStats.pause;
                result.totalWorkouts += sessionStats.workouts;
                result.totalActions += sessionStats.actions;
                sessionStats.actionsDetail.forEach((actions, workoutName) => {
                    actions.forEach((action) => {
                        let name = action.name;
                        let reps = action.reps;
                        if (name!='') {
                            if (actionsStats.has(name)) {
                                let current = actionsStats.get(name);
                                actionsStats.set(name, current + reps);
                            }
                            else {
                                actionsStats.set(name, reps);
                            }
                        }
                    });
                });
            });
            
            // Sort actionsStats
            let arrayActionStats = actionsStats.entries().toArray();
            result.actionsStats = arrayActionStats.sort((a,b) => b[1]-a[1]);

            res.resolve(result);
        });
        return res.promise();
    }
}