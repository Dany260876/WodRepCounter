import { $ } from 'jquery';
import localforage from 'localforage';

export default class historyService {
    constructor() {}
    static addSession(session) {
        const res = $.Deferred();
        // get sessions history
        localforage.getItem('historySession').then((value) => {
            if (value==null) value = [];
            session.id = new Date().getTime();
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
}