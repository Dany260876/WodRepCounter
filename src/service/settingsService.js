import { $ } from 'jquery';
import localforage from 'localforage';

export default class settingsService {
    constructor() {
    }
    static getDefaults() {
        let defaults = new Map();
        defaults.set('soundsOn', true);
        defaults.set('darkMode', false);
        return defaults;
    }
    static getValue(name, settings) {
        return settings.get(name);        
    }
    static saveSettings(name,newValue,settings) {
        const res = $.Deferred();
        settings.set(name, newValue);
        // Save Settings
        localforage.setItem('wrcSettings', settings).then((obj) => {
            res.resolve(settings);
        }).catch((err) => {
            res.reject(err);
        });        
        return res.promise();
    }
   static getSettings() {
        const res = $.Deferred();
        // get sessions history
        localforage.getItem('wrcSettings').then((value) => {
            if (value==null) value = settingsService.getDefaults();
            res.resolve(value);
        }).catch((err) => {
            res.reject(err);
        });
        return res.promise();
    }
}