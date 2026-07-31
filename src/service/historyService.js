import $ from 'jquery';
import localforage from 'localforage';

export default class historyService {
    constructor() {}
    static addSession(session) {
        const res = $.Deferred();
        // get sessions history
        localforage.getItem('historySession').then((value) => {
            if (value==null) value = [];
            value.push(session);
            localforage.setItem('historySession', value).then((obj) => {
                res.resolve(session);
            }).catch((err) => {
                res.reject(err);
            });
        }).catch((err) => {
            res.reject(err);
        });
        return res.promise();
    }
    static getSessionByDate(date) {
        const res = $.Deferred();
        let stringDate = date.toLocaleDateString();
        localforage.getItem('historySession').then((values) => { 
            values.forEach((val) => {
                if (new Date(val.startDate).toLocaleDateString()==stringDate) {
                    res.resolve(val);
                    return;
                }
            });
            res.resolve(null);
        });
        return res.promise();
    }
    static getHistory() {
        const res = $.Deferred();
        // get sessions history
        localforage.getItem('historySession').then((value) => {
            if (value==null) value = [];
            res.resolve(value);
        }).catch((err) => {
            res.reject(err);
        });
        return res.promise();
    }
    static clearHistory() {
        const res = $.Deferred();
        localforage.removeItem('historySession').then(() => {
            res.resolve();
        }).catch((err) => {
            res.reject(err);
        });
        return res.promise();
    }
    static restoreHistory(values) {
        const res = $.Deferred();
        localforage.setItem('historySession', values).then((obj) => {
            res.resolve();
        }).catch((err) => {
            res.reject(err);
        });
        return res.promise();
    }
}