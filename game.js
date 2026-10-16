const $=id=>document.getElementById(id);
let saved;try{saved=JSON.parse(localStorage.getItem('aviv-maze-v1'))||{};}catch{saved={};}
let stage=0,grid,route,cols,rows,goal,position,trail=[],drawing=false,pointer=null,penalty=0,extra=0,sound=true,lastError=-Infinity;
let timerId=null,attemptStarted=0,elapsedSeconds=0;
function updateTimer(){elapsedSeconds=Math.floor((performance.now()-attemptStarted)/1000);$('timer').textContent=`${elapsedSeconds} s`;}
function stopTimer(){if(timerId!==null)clearInterval(timerId);timerId=null;}
function startTimer(){stopTimer();attemptStarted=performance.now();elapsedSeconds=0;$('timer').textContent='0 s';timerId=setInterval(updateTimer,200);}
function wallHit(){
 const activePointer=pointer;drawing=false;pointer=null;
 if(activePointer!==null&&canvas.hasPointerCapture(activePointer))canvas.releasePointerCapture(activePointer);
 penalty+=12;bumps++;lastError=performance.now();position={x:.5,y:.5};trail=[];collected=0;careful=0;visited=new Set([0]);
 for(const acorn of acorns)acorn.taken=false;
 $('points').textContent=Math.max(0,1000-penalty);$('support').hidden=bumps<4;
 updateTrail();startTimer();$('hint').textContent='Oops, a wall! Back to Start. Lift your pen and try again.';tone(220,.12,130);paint();
}
const names=['A little hello','Around the bend','Fern trail','Pebble path','Butterfly corner','Sunny clearing','Mossy stones','Bunny’s shortcut','Oak tree trail','Over the bridge','The winding woods','Foxglove lane','Acorn adventure','Hidden hollow','Deer’s crossing','Deep green forest','The long way home','Twilight trail','Starlight journey','The grand adventure'];
const animals=[{icon:'🐰',name:'bunny'},{icon:'🦊',name:'fox'},{icon:'🦉',name:'owl'},{icon:'🐻',name:'bear'},{icon:'🦔',name:'hedgehog'},{icon:'🐿️',name:'squirrel'},{icon:'🦌',name:'deer'},{icon:'🦝',name:'raccoon'}];
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function store(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
let forest=read('aviv-forest-v1',{friends:[],acorns:0,finishes:0}),daily=read('aviv-daily-v1',{}),mode='journey',dailyStep=0,acorns=[],collected=0,visited=new Set(),careful=0,bumps=0,geometry=[],animal=animals[0],variant='gentle';
sound=read('aviv-sound',true);
function dateKey(){let d=new Date();return [d.getFullYear(),d.getMonth()+1,d.getDate()].join('-');}
function dailyCount(){return daily[dateKey()]||0;}
function begin(n,m='journey'){mode=m;dailyStep=m==='daily'?dailyCount():0;start(n);}
function forestMenu(){
 $('collection').textContent=forest.friends.length?forest.friends.map(i=>animals[i].icon).join('  '):'Your animal friends will live here.';
 $('forest-count').textContent=`${forest.friends.length} / ${animals.length} friends · ${forest.acorns} acorns`;
 $('decorations').textContent='🌱 '+(forest.finishes>=3?'🌼 ':'')+(forest.finishes>=6?'🌳 ':'')+(forest.finishes>=10?'🍄 ':'')+(forest.finishes>=15?'🌻 ':'');
 $('daily').textContent=dailyCount()>=3?'Today’s adventure complete ✓':`☀ Today’s animal adventure · ${dailyCount()} / 3`;
 $('daily').disabled=dailyCount()>=3;
}
function makeGeometry(){geometry=[];for(let a=0;a<grid.length;a++)for(let b of grid[a])if(b>a){let x=a%cols+.5,y=Math.floor(a/cols)+.5,dx=b%cols-a%cols,dy=Math.floor(b/cols)-Math.floor(a/cols),pts=[];for(let i=0;i<=16;i++){let t=i/16,bend=variant==='curvy'?Math.sin(Math.PI*t)*.13:0;pts.push({x:x+dx*t-dy*bend,y:y+dy*t+dx*bend});}geometry.push(pts);}}
function updateTrail(){ $('acorns').textContent=`🌰 ${collected} / ${acorns.length}`;$('care').value=Math.min(100,careful*4);}
const canvas=$('maze'),ctx=canvas.getContext('2d');let layout;
function unlocked(){let n=0;while(saved[n]&&n<20)n++;return Math.min(n,19);}
function menu(){ stopTimer();drawing=false;pointer=null;forestMenu(); $('select').hidden=false;$('play').hidden=true;$('levels').replaceChildren();for(let i=0;i<20;i++){let b=document.createElement('button');b.className='level'+(i===unlocked()?' current':'');b.disabled=i>unlocked();b.innerHTML=`${i+1}<small>${saved[i]?'★'.repeat(saved[i].stars)+'☆'.repeat(3-saved[i].stars):i>unlocked()?'⌑':'LET’S GO'}</small>`;b.setAttribute('aria-label',`Maze ${i+1}${b.disabled?', locked':''}`);b.onclick=()=>begin(i);$('levels').append(b);}$('completed').textContent=`${Object.keys(saved).length} / 20`;}
function generate(n){
 cols=6+Math.floor(n/3);rows=4+Math.floor(n/4);
 const total=cols*rows,minimum=Math.ceil(total*.65);
 function findGoal(){
  const parents=Array(total).fill(-2),distance=Array(total).fill(0),queue=[0];parents[0]=-1;
  for(const a of queue)for(const b of grid[a])if(parents[b]===-2){parents[b]=a;distance[b]=distance[a]+1;queue.push(b);}
  // The farthest room in a tree is always a dead end.
  goal=queue.reduce((best,a)=>distance[a]>distance[best]?a:best,0);
  route=[];for(let a=goal;a!==-1;a=parents[a])route.unshift(a);
 }
 for(let attempt=0;attempt<40;attempt++){
  grid=Array.from({length:total},()=>[]);const seen=new Set([0]),stack=[0];
  while(stack.length){
   const a=stack.at(-1),x=a%cols,y=Math.floor(a/cols),options=[];
   if(x>0)options.push(a-1);if(x<cols-1)options.push(a+1);if(y>0)options.push(a-cols);if(y<rows-1)options.push(a+cols);
   const available=options.filter(b=>!seen.has(b));if(!available.length){stack.pop();continue;}
   const b=available[Math.floor(Math.random()*available.length)];grid[a].push(b);grid[b].push(a);seen.add(b);stack.push(b);
  }
  findGoal();if(route.length>=minimum)return;
 }
 // Bounded fallback guarantees a long, connected trail even with an unlucky random source.
 const snake=[],vertical=Math.random()<.5;
 for(let a=0;a<(vertical?cols:rows);a++)for(let b=0;b<(vertical?rows:cols);b++){
  const along=a%2?(vertical?rows:cols)-1-b:b;snake.push(vertical?along*cols+a:a*cols+along);
 }
 grid=Array.from({length:total},()=>[]);for(let i=1;i<snake.length;i++){grid[snake[i-1]].push(snake[i]);grid[snake[i]].push(snake[i-1]);}findGoal();
}
function goalPosition(){return {x:goal%cols+.5,y:Math.floor(goal/cols)+.5};}
function start(n){stage=n;extra=mode==='cozy'?.1:0;penalty=0;trail=[];drawing=false;pointer=null;lastError=-Infinity;bumps=0;careful=0;collected=0;visited=new Set([0]);variant=$('trail-style').value;generate(mode==='cozy'?0:n);makeGeometry();animal=animals[Number($('mission').value)];let candidates=grid.map((_,i)=>i).filter(i=>i!==0&&i!==goal);candidates.sort(()=>Math.random()-.5);acorns=candidates.slice(0,Math.min(3,candidates.length)).map(i=>({id:i,x:i%cols+.5,y:Math.floor(i/cols)+.5,taken:false}));updateTrail();$('support').hidden=true;position={x:.5,y:.5};$('select').hidden=true;$('play').hidden=false;$('stage-label').textContent=mode==='daily'?`TODAY’S ADVENTURE ${dailyStep+1} OF 3`:mode==='cozy'?'A COZY LITTLE TRAIL':`ADVENTURE ${n+1} OF 20`;$('stage-name').textContent=`${animal.icon} Help the ${animal.name} get home`;;$('difficulty').textContent=n<5?'🌱 Little trails':n<12?'🌿 Growing explorer':'🌳 Woodland adventurer';$('points').textContent=1000;$('hint').textContent='Trace to the home. Touching a wall sends you back to Start.';startTimer();resize();}
function resize(){let rect=canvas.getBoundingClientRect();canvas.width=rect.width*devicePixelRatio;canvas.height=rect.height*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);let cell=Math.min((rect.width-48)/cols,(rect.height-48)/rows);layout={cell,ox:(rect.width-cols*cell)/2,oy:(rect.height-rows*cell)/2,w:rect.width,h:rect.height};paint();}
function width(){return Math.min(.84,.73-stage*.012+extra);}
function point(p){return{x:layout.ox+p.x*layout.cell,y:layout.oy+p.y*layout.cell};}
function paint(){if(!layout||!grid)return;let {cell,ox,oy,w,h}=layout;ctx.clearRect(0,0,w,h);ctx.lineCap='round';ctx.lineJoin='round';function corridors(color,lineWidth){ctx.strokeStyle=color;ctx.lineWidth=lineWidth;for(let pts of geometry){ctx.beginPath();pts.forEach((p,i)=>{let v=point(p);i?ctx.lineTo(v.x,v.y):ctx.moveTo(v.x,v.y);});ctx.stroke();}}corridors('#c7d2b6',cell*width()+4);corridors('#fffdf2',cell*width());ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${cell*.27}px sans-serif`;for(let a of acorns)if(!a.taken){let p=point(a);ctx.fillText('🌰',p.x,p.y);}if(trail.length){ctx.strokeStyle='#89bba3';ctx.lineWidth=Math.max(4,cell*.10);ctx.beginPath();trail.forEach((p,i)=>{let a=point(p);i?ctx.lineTo(a.x,a.y):ctx.moveTo(a.x,a.y);});ctx.stroke();}let s=point({x:.5,y:.5}),e=point(goalPosition());ctx.fillStyle='#d7e9bf';ctx.beginPath();ctx.arc(s.x,s.y,cell*.23,0,Math.PI*2);ctx.fill();ctx.fillStyle='#47784b';ctx.font=`600 ${Math.max(9,cell*.13)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('START',s.x,s.y);ctx.fillStyle='#bd8a41';ctx.font=`${cell*.43}px sans-serif`;ctx.fillText('🏡',e.x,e.y);let p=point(position);ctx.fillStyle=performance.now()-lastError<250?'#dc9573':'#355f49';ctx.beginPath();ctx.arc(p.x,p.y,Math.max(5,cell*.095),0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.font=`${Math.max(15,cell*.27)}px sans-serif`;ctx.fillText(animal.icon,p.x,p.y);}
// Distance to the maze's connected center lines defines a corridor, including corners.
function valid(p){let r=width()/2;for(let pts of geometry)for(let i=1;i<pts.length;i++){let a=pts[i-1],b=pts[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));if(Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy)<=r)return true;}return false;}
function coords(e){let r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left-layout.ox)/layout.cell,y:(e.clientY-r.top-layout.oy)/layout.cell};}
canvas.onpointerdown=e=>{if(pointer!==null)return;let p=coords(e);if(Math.hypot(p.x-position.x,p.y-position.y)>.42){$('hint').textContent='Start at the green dot — your trail is waiting there.';return;}e.preventDefault();unlockAudio();pointer=e.pointerId;canvas.setPointerCapture(pointer);drawing=true;if(!trail.length)trail.push({...position});$('hint').textContent='Follow the path to the little home. Take your time.';};
canvas.onpointermove=e=>{if(!drawing||e.pointerId!==pointer)return;e.preventDefault();let target=coords(e),from={...position},distance=Math.hypot(target.x-from.x,target.y-from.y),steps=Math.ceil(distance/.035);for(let i=1;i<=steps;i++){let p={x:from.x+(target.x-from.x)*i/steps,y:from.y+(target.y-from.y)*i/steps};if(!valid(p)){wallHit();break;}position=p;trail.push(p);let key=`${Math.round(p.x*8)},${Math.round(p.y*8)}`;if(!visited.has(key)){visited.add(key);careful++;}for(let a of acorns)if(!a.taken&&Math.hypot(p.x-a.x,p.y-a.y)<.25){a.taken=true;collected++;tone(880);}updateTrail();if(Math.hypot(p.x-goalPosition().x,p.y-goalPosition().y)<.25){finish();break;}}paint();};
function release(e){if(e.pointerId!==pointer)return;drawing=false;pointer=null;$('hint').textContent='Take a rest. Put your pen back on your dot to continue.';}
canvas.onpointerup=release;canvas.onpointercancel=release;canvas.onlostpointercapture=release;
function unlockAudio(){if(!sound)return;try{tone.ac ||= new(window.AudioContext||window.webkitAudioContext)();if(tone.ac.state==='suspended')tone.ac.resume().catch(()=>{});}catch{}}
function tone(freq,duration=.16,end=freq){if(!sound)return;try{unlockAudio();let ac=tone.ac,o=ac.createOscillator(),g=ac.createGain();o.connect(g);g.connect(ac.destination);o.type='sine';o.frequency.setValueAtTime(freq,ac.currentTime);o.frequency.exponentialRampToValueAtTime(end,ac.currentTime+duration);g.gain.setValueAtTime(.09,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+duration);o.start();o.stop(ac.currentTime+duration);}catch{}}
function finish(){updateTimer();stopTimer();drawing=false;pointer=null;let score=Math.max(0,1000-penalty),stars=score>=900?3:score>=650?2:1;if(mode==='journey'&&(!saved[stage]||score>saved[stage].score))saved[stage]={score,stars};try{localStorage.setItem('aviv-maze-v1',JSON.stringify(saved));}catch{}forest.finishes++;forest.acorns+=collected;let friend=Number($('mission').value),newFriend=!forest.friends.includes(friend);if(newFriend)forest.friends.push(friend);store('aviv-forest-v1',forest);if(mode==='daily'){daily[dateKey()]=Math.min(3,dailyStep+1);if(dailyStep===2)forest.acorns+=5;store('aviv-daily-v1',daily);store('aviv-forest-v1',forest);}document.querySelector('.win-icon').textContent=animal.icon;$('reward').textContent=(newFriend?`The ${animal.name} joined your woodland! `:'Your woodland is growing! ')+`🌰 ${collected} acorns collected.`+(mode==='daily'&&dailyStep===2?' Daily adventure finished: 5 bonus acorns!':'');$('stars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);$('result').textContent=`${score} points · ${elapsedSeconds} seconds · ${stars===3?'Wonderful tracing!':stars===2?'Lovely exploring!':'You kept going! Well done.'}`;$('next').textContent=mode==='daily'?(dailyStep===2?'Back to my woodland':'Next rescue →'):mode==='cozy'?'Another cozy trail →':stage===19?'All adventures ✓':'Next adventure →';$('challenge').hidden=score<900;$('win').showModal();tone(660);}
$('continue').onclick=()=>begin(unlocked());$('home').onclick=e=>{e.preventDefault();menu();};$('back').onclick=menu;$('restart').onclick=()=>start(stage);$('retry').onclick=()=>{$('win').close();start(stage);};$('next').onclick=()=>{$('win').close();mode==='daily'?(dailyStep===2?menu():(dailyStep++,start(Math.min(unlocked(),dailyStep*2)))):mode==='cozy'?start(0):stage===19?menu():start(stage+1);};$('wider').onclick=()=>{extra=Math.min(.3,extra+.1);paint();$('hint').textContent='A little more room to explore. You’ve got this!';};$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'♪ Sound on':'♪ Sound off';$('sound').setAttribute('aria-pressed',sound);store('aviv-sound',sound);tone(440);};window.addEventListener('resize',()=>{if(!$('play').hidden)resize();});$('challenge').onclick=()=>{$('win').close();start(stage);extra=-.06;paint();$('hint').textContent='A little trickier! You can use Wider path any time.';};$('daily').onclick=()=>begin(Math.min(unlocked(),dailyCount()*2),'daily');$('cozy').onclick=()=>begin(0,'cozy');$('support').onclick=()=>{mode='cozy';start(0);};$('sound').textContent=sound?'♪ Sound on':'♪ Sound off';$('sound').setAttribute('aria-pressed',sound);menu();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(()=>{});

