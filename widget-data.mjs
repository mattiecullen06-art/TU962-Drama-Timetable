import {validate,onDate,addDays,date} from './engine.mjs';

export const palette={Blue:'#0a4fb5',Mint:'#43e6a3',Sky:'#49d3ff',Purple:'#ae79ff',Amber:'#ffc453',Rose:'#ff6680',White:'#ffffff',Black:'#000000',Grey:'#808080'};
export const backgrounds={Light:'#f7f7fa',White:'#ffffff',Cream:'#fff3d6',Blush:'#ffe4ec',Lavender:'#ede4ff','Pale blue':'#dceeff',Sage:'#e2efde',Peach:'#ffe3ce',Slate:'#475569',Ocean:'#123c57',Forest:'#153d30',Burgundy:'#581e38',Midnight:'#0a142e',AMOLED:'#000000',Glass:'#304769',Nord:'#2e3340',Sunset:'#3b1f2b',Transparent:'transparent'};
export const resolveColor=(s,f)=>palette[s]||(/^#[0-9a-f]{6}$/i.test(s)?s:f);
export function lightBackground(name){if(name==='Transparent')return true;const hex=backgrounds[name]||resolveColor(name,'#f7f7fa');const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]>.55;}
export function widgetDay(state,day,time='00:00') {
  const a=state.appearance;
  let d=day, entries=onDate(state.entries,d,a);
  if(a.next) {
    entries=entries.filter(e=>e.end>time);
    for(let i=1;!entries.length&&i<=366;i++) {d=addDays(day,i);entries=onDate(state.entries,d,a);}
    if(!entries.length)d=day;
  }
  return {date:d,entries};
}
// KWGT reads precomputed dates rather than guessing that every week repeats.
export function kustomData(input) {
  const state=validate(input),a=state.appearance;
  const dates=state.entries.filter(e=>e.recurrence==='ONE_OFF').map(e=>e.date);
  const start=[a.semesterStart,...dates].sort()[0],end=[a.semesterEnd,...dates].sort().at(-1);
  if((date(end)-date(start))/86400000>3660)throw Error('Android export supports a maximum of ten years. Shorten your teaching dates.');
  const days={};
  for(let d=start;d<=end;d=addDays(d,1)) {
    const es=onDate(state.entries,d,a),visible=es.slice(0,a.rows);
    days[d]=visible.map(e=>`${e.start}–${e.end}  ${e.module}${a.showType||a.showRoom?'\n'+[a.showType?e.type:'',a.showRoom?e.location:''].filter(Boolean).join(' · '):''}`).join(a.compact?'\n':'\n\n')+(es.length>a.rows?`\n+${es.length-a.rows} more`:'')||'No saved classes';
  }
  const light=lightBackground(a.background);
  return {schemaVersion:1,course:'TU962',timezone:'Europe/Dublin',start,end,days,appearance:{background:backgrounds[a.background]||resolveColor(a.background,'#f7f7fa'),text:resolveColor(a.text,light?'#172334':'#ffffff'),accent:resolveColor(a.accent,'#0a4fb5'),font:a.font,scale:a.scale,corners:a.corners},mode:'today'};
}

