export default class session {
    constructor() {
        this.startDate = new Date();
        this.workoutList = [];
        this.duration = 0;
        this.name = '';
        this.id = new Date().getTime();
    }
    addWorkout(workout) {
        this.workoutList.push(workout);
    }
    getWorkouts() {
        return this.workoutList;
    }
    getWorkout(index) {
        if ((index>=0) && (index<this.workoutList.length))
            return this.workoutList[index];
        return null;
    }
}