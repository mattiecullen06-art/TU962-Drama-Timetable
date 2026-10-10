import {validDate,date} from './engine.mjs';
export function irishDate(s){return validDate(s)?s.split('-').reverse().join('/'):'';}
export function parseIrishDate(s){const match=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);if(!match)return null;const iso=`${match[3]}-${match[2]}-${match[1]}`;return validDate(iso)?iso:null;}
export function prettyDate(s){return date(s).toLocaleDateString('en-IE',{weekday:'long',timeZone:'UTC'})+', '+irishDate(s);}
export function formatDateInput(s){const digits=s.replace(/\D/g,'').slice(0,8);return [digits.slice(0,2),digits.slice(2,4),digits.slice(4,8)].filter(Boolean).join('/');}

