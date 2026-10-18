const fs=require('fs'),vm=require('vm'),assert=require('assert');
const noop=()=>{},context=new Proxy({},{get:(o,k)=>o[k]||noop});
const elements=new Proxy({},{get:(o,k)=>o[k]||(o[k]={hidden:false,value:0,setAttribute:noop,replaceChildren:noop,append:noop,getContext:()=>context,getBoundingClientRect:()=>({width:600,height:600,left:0,top:0}),setPointerCapture:noop,showModal:noop,close:noop,addEventListener:noop})});
let saved={};const c={saved,document:{getElementById:id=>elements[id],createElement:()=>({setAttribute:noop,showModal:noop,close:noop}),body:{append:noop}},read:()=>[],store:(k,v)=>saved[k]=[...v],menu:noop,tone:noop,unlockAudio:noop,devicePixelRatio:1,window:{addEventListener:noop},cancelAnimationFrame:noop,requestAnimationFrame:()=>1,console,assert};
vm.createContext(c);
let source=fs.readFileSync('letters.js','utf8');
source=source.replace(/\}\)\(\);\s*$/, `
assert.equal(paths.length,26);
active=true;
for(let l=0;l<26;l++){
 startLetter(l);
 for(let s=0;s<paths[l].length;s++){
  stroke=s; index=0;
  const p=paths[l][s];
  assert(p.length>10);
  assert.equal(advance({x:-40,y:-40}),false,'Off path accepted');
  const initial=index;
  advance(p[Math.floor(p.length/2)]);
  assert(index<Math.floor(p.length/2),'Shortcut accepted');
  index=initial;
  for(const point of p)assert(advance(point),'Valid path rejected for '+l);
  assert(index>=p.length-2,'Stroke incomplete for '+l);
 }
 stroke=paths[l].length;completeLetter();
 assert.equal(counts[l],1);
 assert(!completed.includes(l),'Letter unlocked after one trace');
 assert.equal(unlocked(),l);
 const before=counts[l];completeLetter();assert.equal(counts[l],before,'Duplicate completion counted');
 el('letter-next').onclick();assert.equal(level,l,'Next button skipped practice');
 for(let repetition=2;repetition<=5;repetition++){
  stroke=paths[l].length;completeLetter();
  assert.equal(counts[l],repetition);
  assert.equal(el('letter-repetitions').textContent,repetition+' / 5 traces completed');
  if(repetition<5){assert.equal(unlocked(),l);el('letter-next').onclick();assert.equal(level,l);}
 }
 assert(completed.includes(l));
 assert.equal(unlocked(),Math.min(25,l+1));
 assert.equal(el('letter-progress').value,100);
}
assert.equal(saved['aviv-letter-counts-v2'].length,26);assert(saved['aviv-letter-counts-v2'].every(n=>n===5));
startLetter(0);index=0;advance(paths[0][0].at(-1));assert(index<3,'Reverse start accepted');
console.log('PASS: all 26 letter paths, ordered tracing, shortcut rejection, five-trace unlocking, repeat counts, duplicate protection, persistence, and progress.');
})();`);
vm.runInContext(source,c);

