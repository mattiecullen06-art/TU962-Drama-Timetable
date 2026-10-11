// Shared by the browser experiment and the Scriptable app-time renderer.
globalThis.renderArcade = async function(model) {
  await document.fonts.load('12px TU962Arcade');
  if(!document.fonts.check('12px TU962Arcade'))throw Error('Arcade font did not load.');
  const canvas=document.createElement('canvas'),width=344,height=model.family==='large'?360:170,ratio=2;
  canvas.width=width*ratio;canvas.height=height*ratio;
  const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);ctx.textBaseline='top';
  const a=model.appearance,pad=12,scale=a.scale||1;
  if(model.background!=='transparent'){
    const r=Math.min(a.corners||0,height/2);ctx.fillStyle=model.background;ctx.beginPath();ctx.moveTo(r,0);ctx.lineTo(width-r,0);ctx.quadraticCurveTo(width,0,width,r);ctx.lineTo(width,height-r);ctx.quadraticCurveTo(width,height,width-r,height);ctx.lineTo(r,height);ctx.quadraticCurveTo(0,height,0,height-r);ctx.lineTo(0,r);ctx.quadraticCurveTo(0,0,r,0);ctx.fill();
  }
  const draws=[];
  function line(text,x,y,max,size,color){ctx.font=`${size}px TU962Arcade`;ctx.fillStyle=color;let s=String(text);while(s.length&&ctx.measureText(s).width>max)s=s.slice(0,-1);if(s!==String(text)){while(s.length&&ctx.measureText(s+'…').width>max)s=s.slice(0,-1);s+='…';}ctx.fillText(s,x,y);draws.push({text:s,x,y,size,color});}
  const titleSize=10*scale,bodySize=9*scale,detailSize=7*scale;
  line(model.heading,pad,pad,width-pad*2,titleSize,model.text);
  line('TU962 · Arcade font test',pad,pad+titleSize+6,width-pad*2,7*scale,model.secondary);
  let y=pad+titleSize+7*scale+18,shown=0;
  const gap=a.compact?5:9,rowHeight=bodySize+detailSize+12+gap;
  const limit=Math.min(a.rows||4,model.entries.length);
  for(const e of model.entries.slice(0,limit)){
    if(y+rowHeight>height-pad-10*scale)break;
    const bar=a.showBars?7:0;
    if(a.showBars){ctx.fillStyle=model.accent;ctx.fillRect(pad,y,3,rowHeight-gap-3);}
    line(e.start,pad+bar,y,51,8*scale,model.time);
    line(e.end,pad+bar,y+11*scale,51,7*scale,model.time);
    const x=pad+bar+58,max=width-pad-x;
    line(e.module,x,y,max,bodySize,model.text);
    const detail=[a.showType?e.type:'',a.showRoom?e.location:''].filter(Boolean).join(' · ');
    if(detail)line(detail,x,y+bodySize+6,max,detailSize,model.secondary);
    shown++;y+=rowHeight;
  }
  if(!model.entries.length)line('No saved classes',pad,y,width-pad*2,9*scale,model.secondary);
  if(shown<model.entries.length)line(`+${model.entries.length-shown} more`,pad,height-pad-8*scale,width-pad*2,8*scale,model.secondary);
  ctx.font='12px TU962Arcade';const arcadeWidth=ctx.measureText('ARCADE 123').width;
  ctx.font='12px monospace';const fallbackWidth=ctx.measureText('ARCADE 123').width;
  return {png:canvas.toDataURL('image/png'),width:canvas.width,height:canvas.height,shown,draws,fontLoaded:true,arcadeWidth,fallbackWidth};
};

