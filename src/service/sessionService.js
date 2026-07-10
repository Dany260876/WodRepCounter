import session from '../class/session'
import workout from '../class/workout'
import action from '../class/action'
import pause from '../class/pause'

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
            result.icon = '&#9889;';
        }
        if (item.type=='PAUSE') {
            result.value = item.duration;
            result.unit = 'seconds';
            result.icon = '&#8987;';
        }
        return result;
    }
}