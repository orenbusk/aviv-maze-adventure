const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{};const ctx=new Proxy({}, {get:(o,k)=>o[k]||noop});const elements=new Proxy({}, {get:(o,k)=>o[k]||(o[k]={value:k==='mission'?'0':k==='trail-style'?'gentle':0,replaceChildren:noop,append:noop,setAttribute:noop,getContext:()=>ctx,getBoundingClientRect:()=>({width:1000,height:600}),showModal:noop,close:noop,hidden:true})});let data={};
const c={document:{getElementById:id=>elements[id],createElement:()=>({setAttribute:noop}),querySelector:()=>({})},localStorage:{getItem:k=>data[k]||null,setItem:(k,v)=>data[k]=v},window:{addEventListener:noop},navigator:{},devicePixelRatio:1,performance:{now:()=>1000},console};vm.createContext(c);
vm.runInContext(fs.readFileSync('game.js','utf8')+`
for(let style of ['gentle','curvy'])for(let n=0;n<20;n++)for(let j=0;j<2;j++){
 variant=style;stage=n;generate(n);makeGeometry();let seen=new Set([0]),q=[0];for(let a of q)for(let b of grid[a])if(!seen.has(b)){seen.add(b);q.push(b);}if(seen.size!==cols*rows)throw Error('Disconnected');if(grid[goal].length!==1)throw Error('Goal is not a dead end');if(route.at(-1)!==goal||route.length<Math.ceil(cols*rows*.65))throw Error('Route too short');for(let pts of geometry)for(let p of [pts[0],pts[8],pts[16]])if(!valid(p))throw Error('Blocked path');if(valid({x:-1,y:-1}))throw Error('Outside accepted');
}
const actualRandom=Math.random;Math.random=()=>0;generate(19);if(grid[goal].length!==1||route.length<Math.ceil(cols*rows*.65))throw Error('Fallback invalid');Math.random=actualRandom;
begin(0);if(acorns.length!==3)throw Error('Acorns missing');finish();if(!saved[0]||forest.friends.length!==1)throw Error('Progress not saved');
begin(0,'cozy');finish();if(saved[1])throw Error('Cozy unlocked stage');
for(let i=0;i<3;i++){begin(0,'daily');finish();}if(dailyCount()!==3)throw Error('Daily incomplete');menu();if(!document.getElementById('daily').disabled)throw Error('Daily button enabled');
let notes=0;window.AudioContext=class{constructor(){this.currentTime=0;this.state='running';this.destination={};}createOscillator(){notes++;return{connect(){},frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},start(){},stop(){}};}createGain(){return{connect(){},gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}}};}};sound=true;tone(220,.12,130);if(notes!==1)throw Error('Wall sound missing');sound=false;tone(220);if(notes!==1)throw Error('Mute ignored');
console.log('PASS: 80 gentle/curved mazes, collision geometry, rescue rewards, cozy mode, daily completion.');`,c);
