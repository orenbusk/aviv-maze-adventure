/* Capital print letters: each array is one directed pen stroke. */
(()=>{
const el=id=>document.getElementById(id), line=(...p)=>p.map(([x,y])=>({x,y}));
const arc=(cx,cy,rx,ry,a,b)=>Array.from({length:65},(_,i)=>({x:cx+rx*Math.cos(a+(b-a)*i/64),y:cy+ry*Math.sin(a+(b-a)*i/64)}));
const L=line, pi=Math.PI;
const letters=[
[L([25,85],[50,15],[75,85]),L([35,58],[65,58])],
[L([28,15],[28,85]),[...arc(28,32.5,43,17.5,-pi/2,pi/2),...arc(28,67.5,47,17.5,-pi/2,pi/2)]],
[arc(52,50,30,35,-pi/4,-7*pi/4)],
[L([28,15],[28,85]),arc(28,50,47,35,-pi/2,pi/2)],
[L([72,15],[28,15],[28,85],[72,85]),L([28,50],[64,50])],
[L([72,15],[28,15],[28,85]),L([28,50],[64,50])],
[[...arc(52,50,30,35,-pi/4,-7*pi/4),...L([73,58],[53,58])]],
[L([28,15],[28,85]),L([72,15],[72,85]),L([28,50],[72,50])],
[L([30,15],[70,15]),L([50,15],[50,85]),L([30,85],[70,85])],
[[...L([70,15],[70,65]),...arc(47.5,65,22.5,20,0,pi)]],
[L([28,15],[28,85]),L([74,15],[28,52],[74,85])],
[L([28,15],[28,85],[74,85])],
[L([22,85],[22,15],[50,55],[78,15],[78,85])],
[L([25,85],[25,15],[75,85],[75,15])],
[arc(50,50,29,35,-pi/2,-5*pi/2)],
[L([28,85],[28,15]),arc(28,34,46,19,-pi/2,pi/2)],
[arc(50,50,29,35,-pi/2,-5*pi/2),L([55,65],[80,90])],
[L([28,85],[28,15]),arc(28,34,46,19,-pi/2,pi/2),L([28,53],[76,85])],
[[...arc(50,32.5,27,17.5,-pi/5,-3*pi/2),...arc(50,67.5,27,17.5,-pi/2,4*pi/5)]],
[L([20,15],[80,15]),L([50,15],[50,85])],
[[...L([25,15],[25,60]),...arc(50,60,25,25,pi,0),...L([75,60],[75,15])]],
[L([22,15],[50,85],[78,15])],
[L([15,15],[32,85],[50,45],[68,85],[85,15])],
[L([25,15],[75,85]),L([75,15],[25,85])],
[L([25,15],[50,50]),L([75,15],[50,50],[50,85])],
[L([25,15],[75,15],[25,85],[75,85])]
];
function sample(points){const out=[points[0]];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)));for(let j=1;j<=n;j++)out.push({x:a.x+(b.x-a.x)*j/n,y:a.y+(b.y-a.y)*j/n});}return out;}
const paths=letters.map(strokes=>strokes.map(sample));
const requiredTraces=5;
const legacy=read('aviv-letters-v1',[]), storedCounts=read('aviv-letter-counts-v2',null);
const counts=Array.from({length:26},(_,i)=>storedCounts&&Number.isInteger(storedCounts[i])?Math.max(0,Math.min(requiredTraces,storedCounts[i])):Array.isArray(legacy)&&legacy.includes(i)?1:0);
let completed=counts.map((n,i)=>n>=requiredTraces?i:-1).filter(i=>i>=0);
function updateCount(){el('letter-repetitions').textContent=counts[level]+' / '+requiredTraces+' traces completed';}
const canvas=el('letter-canvas'),ctx=canvas.getContext('2d');
let active=false,level=0,stroke=0,index=0,held=null,last=null,scale=1,ox=0,oy=0,animation=null,done=false,lastCheer=-1;
const cheers=['Hooray, Aviv! You wrote a beautiful letter! 🎉','Amazing tracing, Aviv! High five! 🙌','You did it! Your letter is ready to shine! ✨','Hip hip hooray! What a wonderful writer! 🌈','Fantastic, Aviv! A big cheer for you! 🥳','Look at that letter! You’re a tracing star! ⭐'];
const dialog=document.createElement('dialog');dialog.innerHTML='<div class="win-icon">🎉</div><div class="eyebrow">LETTER COMPLETE</div><h2 id="letter-cheer"></h2><p id="letter-reward"></p><div class="win-actions"><button id="letter-again">Trace again</button><button class="primary" id="letter-next">Next letter →</button></div>';document.body.append(dialog);
function unlocked(){let n=0;while(completed.includes(n)&&n<25)n++;return n;}
function clear(){held=null;last=null;if(animation!==null)cancelAnimationFrame(animation);animation=null;}
function menuLetters(){clear();el('letter-menu').hidden=false;el('letter-play').hidden=true;el('letter-count').textContent=completed.length+' / 26 letters learned';el('letter-levels').replaceChildren();for(let i=0;i<26;i++){const b=document.createElement('button');b.className='level'+(i===unlocked()?' current':'');b.textContent=String.fromCharCode(65+i)+(completed.includes(i)?' ★':'');const counter=document.createElement('small');counter.textContent=counts[i]+' / '+requiredTraces;b.append(counter);b.disabled=i>unlocked();b.setAttribute('aria-label','Letter '+String.fromCharCode(65+i)+(b.disabled?', locked':''));b.onclick=()=>startLetter(i);el('letter-levels').append(b);}}
function switchSection(lettersOn){active=lettersOn;clear();menu();el('maze-section').hidden=lettersOn;el('letters-section').hidden=!lettersOn;el('choose-mazes').setAttribute('aria-pressed',!lettersOn);el('choose-letters').setAttribute('aria-pressed',lettersOn);if(lettersOn)menuLetters();}
el('choose-letters').onclick=()=>switchSection(true);el('choose-mazes').onclick=()=>switchSection(false);
el('home').addEventListener('click',()=>switchSection(false));
function hint(){el('letter-hint').textContent='Stroke '+(stroke+1)+' of '+paths[level].length+': start on the green '+(stroke+1)+' dot. Follow the arrow.';}
function startLetter(n){if(n>unlocked())return;clear();level=n;stroke=0;index=0;done=false;el('letter-menu').hidden=true;el('letter-play').hidden=false;el('letter-stage').textContent='LETTER '+(n+1)+' OF 26 · CAPITAL LETTERS';el('letter-title').textContent='Let’s write '+String.fromCharCode(65+n);updateCount();hint();resizeLetter();}
function resizeLetter(){if(!active||el('letter-play').hidden)return;const r=canvas.getBoundingClientRect();canvas.width=r.width*devicePixelRatio;canvas.height=r.height*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);scale=Math.min(r.width,r.height)/110;ox=(r.width-100*scale)/2;oy=(r.height-100*scale)/2;paintLetter();}
function drawPath(p,color,width){if(!p.length)return;ctx.beginPath();p.forEach((v,i)=>i?ctx.lineTo(ox+v.x*scale,oy+v.y*scale):ctx.moveTo(ox+v.x*scale,oy+v.y*scale));ctx.strokeStyle=color;ctx.lineWidth=width*scale;ctx.stroke();}
function paintLetter(preview){const r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);ctx.lineCap='round';ctx.lineJoin='round';for(const y of [15,50,85])drawPath(L([8,y],[92,y]),'#d9dfce',.4);paths[level].forEach((p,i)=>{drawPath(p,'#d2dcc7',10);if(i<stroke||done)drawPath(p,'#629c79',6);});if(done)return;const p=paths[level][stroke];drawPath(p.slice(0,index+1),'#629c79',6);const a=p[preview??index],b=p[Math.min(p.length-1,(preview??index)+12)];ctx.fillStyle='#315c42';ctx.beginPath();ctx.arc(ox+a.x*scale,oy+a.y*scale,5*scale,0,2*pi);ctx.fill();ctx.fillStyle='white';ctx.font='bold '+(5*scale)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(stroke+1,ox+a.x*scale,oy+a.y*scale);const angle=Math.atan2(b.y-a.y,b.x-a.x),x=ox+b.x*scale,y=oy+b.y*scale;ctx.beginPath();ctx.moveTo(x-4*scale*Math.cos(angle-.6),y-4*scale*Math.sin(angle-.6));ctx.lineTo(x,y);ctx.lineTo(x-4*scale*Math.cos(angle+.6),y-4*scale*Math.sin(angle+.6));ctx.strokeStyle='#315c42';ctx.lineWidth=scale;ctx.stroke();el('letter-progress').value=100*(stroke+index/(p.length-1))/paths[level].length;}
function coordsLetter(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left-ox)/scale,y:(e.clientY-r.top-oy)/scale};}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
canvas.onpointerdown=e=>{if(done||held!==null||animation!==null)return;const p=coordsLetter(e);if(distance(p,paths[level][stroke][index])>6){hint();return;}e.preventDefault();held=e.pointerId;last=p;canvas.setPointerCapture(held);unlockAudio();};
function advance(p){const path=paths[level][stroke];let best=index,d=Infinity;for(let j=Math.max(0,index-3);j<=Math.min(path.length-1,index+10);j++){const next=distance(p,path[j]);if(next<d){d=next;best=j;}}if(d>6)return false;index=Math.max(index,best);return true;}
canvas.onpointermove=e=>{if(e.pointerId!==held||done)return;e.preventDefault();const target=coordsLetter(e),from=last,n=Math.max(1,Math.ceil(distance(from,target)));for(let j=1;j<=n;j++){const p={x:from.x+(target.x-from.x)*j/n,y:from.y+(target.y-from.y)*j/n};if(!advance(p)){held=null;last=null;el('letter-hint').textContent='A little off the trail! Put your pen back on the green dot and keep going.';paintLetter();return;}if(index>=paths[level][stroke].length-2){held=null;last=null;stroke++;index=0;tone(660);if(stroke===paths[level].length){completeLetter();return;}hint();el('letter-hint').textContent='Lovely! Lift your pen. '+el('letter-hint').textContent;paintLetter();return;}}last=target;paintLetter();};
const release=e=>{if(e.pointerId===held){held=null;last=null;el('letter-hint').textContent='Take your time. Put your pen back on the green dot to continue.';}};
canvas.onpointerup=release;canvas.onpointercancel=release;canvas.onlostpointercapture=release;
function completeLetter(){if(done)return;done=true;el('letter-progress').value=100;paintLetter();counts[level]=Math.min(requiredTraces,counts[level]+1);completed=counts.map((n,i)=>n>=requiredTraces?i:-1).filter(i=>i>=0);store('aviv-letter-counts-v2',counts);updateCount();let pick=Math.floor(Math.random()*(cheers.length-1));if(pick>=lastCheer)pick++;pick%=cheers.length;lastCheer=pick;el('letter-cheer').textContent=cheers[pick];el('letter-reward').textContent=String.fromCharCode(65+level)+': '+counts[level]+' / '+requiredTraces+' traces completed. '+(counts[level]<requiredTraces?'Let’s practice this letter again!':'You learned this letter! '+completed.length+' of 26 letters complete.');el('letter-next').textContent=counts[level]<requiredTraces?'Keep practicing →':level===25?'All letters ✓':'Next letter →';dialog.showModal();tone(880,.3,1320);}
el('letter-again').onclick=()=>{dialog.close();startLetter(level);};el('letter-next').onclick=()=>{dialog.close();counts[level]<requiredTraces?startLetter(level):level===25?menuLetters():startLetter(level+1);};
el('letters-back').onclick=menuLetters;el('letter-restart').onclick=()=>startLetter(level);
el('letter-demo').onclick=()=>{if(done)return;clear();let start=null;const p=paths[level][stroke];function frame(t){if(start===null)start=t;const i=Math.floor((t-start)/18);if(i>=p.length){animation=null;paintLetter();return;}paintLetter(i);animation=requestAnimationFrame(frame);}animation=requestAnimationFrame(frame);};
window.addEventListener('resize',resizeLetter);
})();
