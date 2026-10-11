import {defaults} from '../engine.mjs';
import {backgrounds,palette,lightBackground,resolveColor} from '../widget-data.mjs';
const entries=[{module:'Dev. the Body 5: Singing',type:'Lecture',location:'EQ-016 Recital Hall',start:'10:00',end:'13:00'},{module:'Acting to Camera',type:'Lecture',location:'EQ-006a Drama Practice Room 1',start:'14:00',end:'18:00'}];
const select=document.getElementById('background');
for(const [name] of Object.entries(backgrounds)){const option=document.createElement('option');option.value=name;option.textContent=name;select.append(option);}
select.value='Midnight';
async function render(){
  const status=document.getElementById('status');status.textContent='Rendering…';
  try {
    const name=select.value,light=lightBackground(name),a={...defaults,background:name,scale:Number(document.getElementById('scale').value),compact:document.getElementById('compact').checked};
    const result=await renderArcade({family:document.getElementById('size').value,entries,heading:'Monday, 05/10/2026',appearance:a,background:backgrounds[name],text:light?'#172334':'#ffffff',secondary:light?'#526075':'#d0daed',accent:'#43e6a3',time:'#43e6a3'});
    document.getElementById('preview').src=result.png;
    document.getElementById('download').href=result.png;
    status.textContent=`Arcade font loaded. ${result.shown} classes rendered. Image ${result.width} × ${result.height}. Font width ${result.arcadeWidth.toFixed(1)}; ordinary monospace ${result.fallbackWidth.toFixed(1)}.`;
    document.getElementById('evidence').textContent=JSON.stringify({...result,png:undefined},null,2);
  }catch(error){status.textContent=error.message;}
}
document.getElementById('render').onclick=render;render();

