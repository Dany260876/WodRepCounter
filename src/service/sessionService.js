import { $ } from 'jquery';
import localforage from 'localforage';

import session from '../class/session'
import workout from '../class/workout'
import action from '../class/action'
import pause from '../class/pause'
import iconPause from '../assets/clock.svg?raw'
import iconAction from '../assets/zap.svg?raw'

export default class sessionService {
    constructor() {
        this.session = new session();
    }
    static createWorkout(name, reps) {
        return new workout(name, reps);
    }
    static createAction(type, name, value) {
        if (type.toUpperCase()=='ACTION') return new action(name, value);
        if (type.toUpperCase()=='PAUSE') return new pause(value);
        return {};
    }
    addWorkout(workout) {
        this.session.addWorkout(workout);
    }
    sessionIsValid() {
        let workouts = this.session.getWorkouts();
        if (workouts.length==0) return 'No workout';
        let emptyWorkouts = workouts.filter((w) => w.items.length==0);
        if (emptyWorkouts.length>0) return 'Workout has no action';
        return null;
    }
    getWorkout(index) {
        return this.session.getWorkout(index);
    }
    getItemValueAndUnit(item) {
        let result = {};
        if (item.type=='ACTION') {
            result.value = item.reps;
            result.unit = 'reps';
            result.icon = iconAction;  
        }
        if (item.type=='PAUSE') {
            result.value = item.duration;
            result.unit = 'seconds';
            result.icon = iconPause; 
        }
        return result;
    }
    saveSession(name) {
        const res = $.Deferred();
        if (name.trim()!='') {
            this.session.name = name;
            // get saved sessions & add new
            localforage.getItem('savedSessions').then((value) => {
                if (value==null) value = [];
                value.push(this.session);
                localforage.setItem('savedSessions', value).then((obj) => {
                    res.resolve("Session '" + name + "' saved.");
                }).catch((err) => {
                    res.reject(err);
                });
            }).catch((err) => {
                res.reject(err);
            });
        }
        else
            res.reject('invalid name');

        return res.promise();
    }
    static getSavedSessions() {
        const res = $.Deferred();
        // get saved sessions
        localforage.getItem('savedSessions').then((value) => {
            if (value==null) value = [];
            res.resolve(value);
        }).catch((err) => {
            res.reject(err);
        });
        return res.promise();
    }
    static getSavedSessionByName(name) {
        const res = $.Deferred();
        
        if (name.trim()!='') {
            // get saved sessions
            localforage.getItem('savedSessions').then((values) => {
                if (values!=null) {                  
                    // get item by name
                    let index = values.findIndex((val) => val.name==name);
                    if (index>-1) 
                        res.resolve(values[index]);
                    else
                        res.resolve(null);
                }
                else
                    res.resolve(null);
            }).catch((err) => {
                res.reject(err);
            });
        }
        else
            res.reject('invalid name');
        
        return res.promise();
    }
    static removeSavedSession(name) {
        const res = $.Deferred();
        
        if (name.trim()!='') {
            // get saved sessions & remove selected
            localforage.getItem('savedSessions').then((values) => {
                if (values!=null) {                  
                    // remove item by name
                    let index = values.findIndex((val) => val.name==name);
                    if (index>-1) {
                        values.splice(index, 1);
                    }
                    // Save content
                    localforage.setItem('savedSessions', values).then((obj) => {
                        res.resolve("Session '" + name + "' saved.");
                    }).catch((err) => {
                        res.reject(err);
                    });  
                } 
            }).catch((err) => {
                res.reject(err);
            });
        }
        else
            res.reject('invalid name');
        
        return res.promise();
    }
}