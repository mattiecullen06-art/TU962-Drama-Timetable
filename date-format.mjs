import {validDate,date} from './engine.mjs';
export function irishDate(s){return validDate(s)?s.split('-').reverse().join('/'):'';}
export function parseIrishDate(s){const match=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);if(!match)return null;const iso=`${match[3]}-${match[2]}-${match[1]}`;return validDate(iso)?iso:null;}
export function prettyDate(s){return date(s).toLocaleDateString('en-IE',{weekday:'long',timeZone:'UTC'})+', '+irishDate(s);}

