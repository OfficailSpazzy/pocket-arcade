
/* ---------- Spazzy's Arcade: cabinet launcher ---------- */
const CATCOL={'Arcade':'#ff4d6d','Puzzle':'#ffd23f','Board':'#2ee6b6','Words & Math':'#4cc9f0','Cards & Reflex':'#ff7ac6'};
const $id=i=>document.getElementById(i);
const scr=$id('scr'),sg=scr.getContext('2d');scr.width=640;scr.height=480;
const PS=n=>n+'px "Press Start 2P",monospace',pad2=n=>String(n).padStart(2,'0');
const NG=GAMES.length,AIIDS=['pool','checkers','four','reversi','sea','ttt','duel','rps'];AIIDS.forEach(id=>{const g=GAMES.find(x=>x.id===id);if(g)g.ai=true});
const LISTS={online:AIIDS.map(id=>GAMES.find(x=>x.id===id)).filter(Boolean),offline:GAMES.filter(g=>!g.ai)};
['online','offline'].forEach(m=>LISTS[m].forEach((g,i)=>{g._no=i+1;g._sec=m.toUpperCase()}));
const MODES=[['online','ONLINE','VS COMPUTER','#4cc9f0'],['offline','OFFLINE','SOLO PLAY','#ffd23f']];
let mode=null,sel=0,shown=null,fx=null,typed='',typeT=null,busy=false,raf=0,lastT=0;
const list=()=>mode?LISTS[mode]:MODES,count=()=>list().length,curGame=()=>mode?LISTS[mode][sel]:null;
const NZ=[0,1,2,3].map(()=>{const c=document.createElement('canvas');c.width=160;c.height=120;const x=c.getContext('2d'),d=x.createImageData(160,120);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);return c});
const OV=(()=>{const c=document.createElement('canvas');c.width=640;c.height=480;const x=c.getContext('2d');x.fillStyle='rgba(0,0,0,.24)';for(let y=0;y<480;y+=4)x.fillRect(0,y,640,2);const v=x.createRadialGradient(320,240,150,320,240,430);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.72)');x.fillStyle=v;x.fillRect(0,0,640,480);return c})();
const STARS=Array.from({length:44},()=>({x:Math.random()*320,y:Math.random()*140,s:Math.random()}));

let credits=0;
function backdrop(t){sg.fillStyle='#000';sg.fillRect(0,0,320,240);STARS.forEach(s=>{if(s.s<.55)return;sg.fillStyle=(Math.floor(t*2+s.x)%3)?'#3a3a52':'#6a6a8a';sg.fillRect(s.x|0,(s.y*1.6)|0,1,1)})}
const TXT=(t,x,y,c,n=8,al='center')=>{sg.font=PS(n);sg.textAlign=al;sg.fillStyle=c;sg.fillText(t,x|0,y|0)};
const arrows=t=>{sg.fillStyle='#f4f4f4';const ar=Math.floor(t*3)%2?1:0;sg.fillRect(8+ar,98,2,2);sg.fillRect(10+ar,96,2,6);sg.fillRect(12+ar,94,2,10);sg.fillRect(308-ar,98,2,2);sg.fillRect(306-ar,96,2,6);sg.fillRect(304-ar,94,2,10)};
function modeCard(i,t,zoom){const [id,name,sub,col]=MODES[i];TXT('SELECT MODE',160,20,'#ff2a2a',10);TXT((i+1)+' / 2',160,34,'#6a6a8a',7);
  const sz=Math.round(96*(1+zoom*.7)/32)*32||96;sg.imageSmoothingEnabled=false;sg.drawImage(gameIcon(id),160-sz/2|0,(102-sz/2)|0,sz,sz);
  TXT(name,160,174,col,18);TXT(sub+' · '+LISTS[id].length+' GAMES',160,192,'#f4f4f4',7);if(!zoom){if(Math.floor(t*1.6)%2)TXT('PUSH START BUTTON',160,212,'#f4f4f4',8);arrows(t)}}
function gameCard(m,i,t,zoom){const L=LISTS[m],gm=L[i],col=CATCOL[gm.cat];
  TXT('GAME',14,16,'#ff2a2a',8,'left');TXT(pad2(i+1)+'/'+L.length,14,28,'#f4f4f4',8,'left');
  const best=store.get(bestKey(gm));TXT('HI-SCORE',160,16,'#ff2a2a');TXT(gm.ns?'------':best!=null?String(best):'000000',160,28,'#f4f4f4');
  TXT('TYPE',306,16,'#ff2a2a',8,'right');TXT(gm.cat.split(' ')[0].toUpperCase(),306,28,col,8,'right');
  const sz=Math.round(96*(1+zoom*.7)/32)*32||96;sg.imageSmoothingEnabled=false;sg.drawImage(gameIcon(gm.id),160-sz/2|0,(100-sz/2)|0,sz,sz);
  const nm=gm.name.toUpperCase();let fs=14;sg.font=PS(fs);while(fs>7&&sg.measureText(nm).width>292){fs--;sg.font=PS(fs)}TXT(nm,160,174,'#ffd23f',fs);
  if(!zoom){if(Math.floor(t*1.6)%2)TXT('PUSH START BUTTON',160,200,'#f4f4f4',8);arrows(t)}}
function screenContent(m,i,ox,t,zoom=0){sg.save();sg.translate(ox|0,0);sg.textBaseline='alphabetic';if(m)gameCard(m,i,t,zoom);else modeCard(i,t,zoom);sg.restore();
  TXT('CREDIT '+pad2(credits),14,230,'#f4f4f4',7,'left');TXT(mode?mode.toUpperCase():'©SPAZZY',306,230,mode?MODES[mode==='online'?0:1][3]:'#6a6a8a',7,'right')}

function frame(now){raf=requestAnimationFrame(frame);const t=now/1000,dt=Math.min(.05,lastT?t-lastT:0);lastT=t;
  sg.setTransform(2,0,0,2,0,0);if(fx)fx.t+=dt;backdrop(t);
  if(fx&&fx.type==='change'){const k=Math.min(1,fx.t/.36);
    if(k<.3){screenContent(fx.from.m,fx.from.i,-fx.dir*k*40,t);sg.globalAlpha=.55+.4*(k/.3);sg.drawImage(NZ[R(4)],0,0,320,240);sg.globalAlpha=1}
    else{const p=(k-.3)/.7,e=1-Math.pow(1-p,3);screenContent(mode,sel,fx.dir*(1-e)*320,t);sg.globalAlpha=(1-p)*.6;sg.drawImage(NZ[R(4)],0,0,320,240);sg.globalAlpha=1;
      if(p<.85){sg.setTransform(1,0,0,1,0,0);for(let b=0;b<3;b++){const y=R(460),h=6+R(26);sg.drawImage(scr,0,y,640,h,(Math.random()-.5)*50,y,640,h)}sg.setTransform(2,0,0,2,0,0)}}
    if(k>=1)fx=null}
  else if(fx&&fx.type==='select'){const k=fx.t;screenContent(mode,sel,0,t,Math.min(1,k/.9));sg.fillStyle=`rgba(0,0,0,${Math.min(.7,k*1.6)})`;sg.fillRect(0,0,320,240);
    if(k>.16){if(Math.floor(k*8)%2===0)TXT('PLAYER 1',160,98,'#ff2a2a',18);TXT('GET READY',160,128,'#f4f4f4',11);TXT(curGame().name.toUpperCase(),160,150,'#ffd23f',7)}
    if(k<.12){sg.fillStyle='#fff';sg.globalAlpha=1-k/.12;sg.fillRect(0,0,320,240);sg.globalAlpha=1}
    if(k>.95){sg.fillStyle='#fff';sg.globalAlpha=Math.min(1,(k-.95)*4);sg.fillRect(0,0,320,240);sg.globalAlpha=1}}
  else if(fx&&fx.type==='on'){const k=Math.min(1,fx.t/.5),e=k<.35?0:1-Math.pow(1-(k-.35)/.65,3),h=Math.max(2,240*e);screenContent(mode,sel,0,t);
    sg.fillStyle='#000';sg.fillRect(0,0,320,(240-h)/2);sg.fillRect(0,(240+h)/2,320,240);
    if(k<.35){const w=320*Math.min(1,k/.25);sg.fillStyle='#fff';sg.fillRect(160-w/2,119,w,2)}else{sg.fillStyle=`rgba(255,255,255,${(1-e)*.6})`;sg.fillRect(0,(240-h)/2,320,h)}
    if(k>=1)fx=null}
  else screenContent(mode,sel,0,t);
  sg.setTransform(1,0,0,1,0,0);sg.drawImage(OV,0,0)}

const sfxChange=()=>{noise(.16,.12,0,2600);beep(880,.05,'square',.035);beep(1320,.06,'square',.03,.07)};
const sfxOn=()=>{beep(70,.35,'sawtooth',.05,0,900);noise(.3,.06,.05,5000)};
const sfxSelect=()=>{[523,659,784,1047,784,1047,1319].forEach((f,i)=>beep(f,.085,'square',.045,.18+i*.075))};
const sfxCoinFly=()=>{beep(2093,.04,'square',.025);beep(2637,.04,'square',.02,.25);beep(2093,.04,'square',.02,.5);beep(2637,.04,'square',.018,.72)};
const sfxCoinIn=()=>{noise(.06,.18,0,1800);beep(170,.07,'square',.06,0,90);beep(988,.07,'square',.05,.08);beep(1319,.34,'square',.05,.15)};
function coinDrop(done){const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,cab=$id('cab'),rej=$id('rej1'),slit=rej.querySelector('.slit'),st=$id('start');
  const fin=()=>{rej.classList.remove('lit');void rej.offsetWidth;rej.classList.add('lit');sfxCoinIn();credits=1;done()};
  if(reduce||!cab.animate){fin();return}
  const c=cab.getBoundingClientRect(),a=st.getBoundingClientRect(),s2=slit.getBoundingClientRect();
  const ax=a.left-c.left+a.width/2,ay=a.top-c.top+a.height/2,bx=s2.left-c.left+s2.width/2,by=s2.top-c.top+s2.height/2,sh=s2.height/36;
  const coin=$('div','coinfx',cab),face=$('i','',coin,'S');const T=(x,y,sx,sy)=>`translate(${x}px,${y}px) scale(${sx},${sy==null?sx:sy})`;
  const mx=(ax+bx)/2,peak=Math.min(ay,by)-110,D=1150;sfxCoinFly();
  const an=coin.animate([
    {transform:T(ax,ay,.3),opacity:0,filter:'brightness(1)'},
    {transform:T(ax,ay-40,1.1),opacity:1,offset:.12},
    {transform:T(mx,peak,1.3),opacity:1,offset:.42},
    {transform:T(bx,by-58,1.05),opacity:1,offset:.64},
    {transform:T(bx,by-30,.13,1),opacity:1,offset:.76},
    {transform:T(bx,by,.13,sh*1.05),opacity:1,filter:'brightness(1)',offset:.88},
    {transform:T(bx,by,.04,sh*.7),opacity:0,filter:'brightness(.4)'}],{duration:D,easing:'cubic-bezier(.35,0,.65,1)',fill:'forwards'});
  setTimeout(()=>{face.style.animation='none';face.style.transform='scaleX(1)'},D*.62);
  setTimeout(()=>{beep(1760,.03,'square',.03)},D*.76);
  an.onfinish=()=>{coin.remove();fin()};setTimeout(()=>{if(coin.isConnected){coin.remove();fin()}},D+600)}
function eject(btn){if(busy)return;const cab=$id('cab'),ret=$id('ret'),slit=btn.querySelector('.slit');btn.classList.remove('lit');void btn.offsetWidth;btn.classList.add('lit');
  beep(220,.05,'square',.05);noise(.06,.14,0,1500);[0,1,2].forEach(i=>beep(1400-i*200,.03,'square',.025,.12+i*.07));beep(140,.06,'triangle',.12,.36);
  if(!cab.animate||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  // the coin drops out of the chute inside the coin return cup, rattles, then sits there a moment
  ret.querySelectorAll('.ejectc').forEach(n=>n.remove());const k=$('div','ejectc',ret),h=ret.clientHeight;
  const an=k.animate([{transform:'translate(-50%,-26px) rotate(0deg) scale(.9)',opacity:1},{transform:`translate(-50%,${h-21}px) rotate(80deg) scale(.9)`,offset:.3,easing:'ease-out'},{transform:`translate(-50%,${h-27}px) rotate(110deg) scale(.9)`,offset:.42,easing:'ease-in'},{transform:`translate(-50%,${h-21}px) rotate(130deg) scale(.9,.8)`,offset:.52},{transform:`translate(-50%,${h-23}px) rotate(140deg) scale(.9)`,offset:.58},{transform:`translate(-50%,${h-21}px) rotate(145deg) scale(.9,.8)`,offset:.64,opacity:1},{transform:`translate(-50%,${h-21}px) rotate(145deg) scale(.9,.8)`,offset:.9,opacity:1},{transform:`translate(-50%,${h-21}px) rotate(145deg) scale(.9,.8)`,opacity:0}],{duration:1900,fill:'forwards'});
  setTimeout(()=>beep(2100,.03,'square',.03),570);setTimeout(()=>beep(1900,.03,'square',.02),1000);
  an.onfinish=()=>k.remove()}
function led(){const L=$id('led');L.classList.toggle('typing',!!typed);L.textContent=typed?(typed.length===1?typed+'_':typed):mode?pad2(sel+1):(sel===0?'ON':'OF')}
function announce(){$id('sr').textContent=mode?(mode+' game '+(sel+1)+' of '+count()+': '+curGame().name+', '+curGame().cat):('Mode '+(sel+1)+' of 2: '+MODES[sel][1]+', '+MODES[sel][2])}
function press(b){if(!b)return;b.classList.add('down');setTimeout(()=>b.classList.remove('down'),110)}
function tilt(d){const s=$id('stick');s.classList.remove('l','r');s.classList.add(d>0?'r':'l');clearTimeout(tilt.t);tilt.t=setTimeout(()=>s.classList.remove('l','r'),170)}
function go(i,dir){if(i===sel||busy)return;fx={type:'change',t:0,dir,from:{m:mode,i:sel}};sel=i;if(mode)store.set('sel_'+mode,sel);sfxChange();led();announce()}
function step(d){if(busy)return;typed='';clearTimeout(typeT);tilt(d);go((sel+d+count())%count(),d)}
function enterMode(m){fx={type:'change',t:0,dir:1,from:{m:mode,i:sel}};mode=m;sel=clamp(+store.get('sel_'+m)||0,0,LISTS[m].length-1);sfxChange();[659,880,1175].forEach((f,i)=>beep(f,.07,'square',.04,.12+i*.07));led();announce()}
function modeBack(){if(busy)return;press($id('modeb'));typed='';clearTimeout(typeT);if(!mode){beep(300,.05,'square',.03);return}fx={type:'change',t:0,dir:-1,from:{m:mode,i:sel}};sel=mode==='online'?0:1;mode=null;sfxChange();beep(523,.08,'square',.04,.1);led();announce()}
function commit(){clearTimeout(typeT);if(!typed)return;const n=+typed;typed='';if(n>=1&&n<=count()){if(n-1===sel){led();beep(660,.05,'square',.03);return}go(n-1,n-1>sel?1:-1)}else{SFX.bad();const L=$id('led');L.textContent='ER';L.classList.remove('err');void L.offsetWidth;L.classList.add('err');setTimeout(led,700);return}led()}
function typeDigit(d){if(busy)return;if(!mode){if(d==='1'||d==='2'){beep(600,.04,'square',.035);go(+d-1,d==='2'?1:-1)}else SFX.bad();return}
  typed=(typed+d).slice(-2);if(typed==='0'){typed='';SFX.bad();return led()}beep(500+(+d)*45,.04,'square',.035);led();clearTimeout(typeT);
  if(typed.length===2||+typed*10>count())commit();else typeT=setTimeout(commit,1000)}
function startSel(){if(busy)return;if(typed){commit();return}if(!mode){press($id('start'));enterMode(MODES[sel][0]);return}busy=true;press($id('start'));
  coinDrop(()=>{fx={type:'select',t:0};sfxSelect();const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(()=>{if(reduce)return;noise(.45,.07,0,700);beep(180,.45,'sawtooth',.035,0,1800);const cab=$id('cab'),c=cab.getBoundingClientRect(),s=scr.getBoundingClientRect();cab.style.transformOrigin=`${s.left-c.left+s.width/2}px ${s.top-c.top+s.height/2}px`;cab.classList.add('zoom')},900);
    setTimeout(()=>{nav(curGame().id);$id('cab').classList.remove('zoom');credits=0;busy=false},1400)})}

function show(id){const gm=GAMES.find(x=>x.id===id);shown=gm?id:'';if(gm){mode=gm.ai?'online':'offline';sel=LISTS[mode].indexOf(gm);store.set('sel_'+mode,sel);cancelAnimationFrame(raf);raf=0;play(gm)}
  else{stopGame();el.game.hidden=true;el.home.hidden=false;fx={type:'on',t:0};sfxOn();led();announce();if(!raf){lastT=0;raf=requestAnimationFrame(frame)}}}
function setShown(gm){mode=gm.ai?'online':'offline';sel=LISTS[mode].indexOf(gm);store.set('sel_'+mode,sel);shown=gm.id;try{history.replaceState(null,'','#'+gm.id)}catch(e){}cancelAnimationFrame(raf);raf=0}
function nav(id){try{if(id)location.hash=id;else history.replaceState(null,'',location.pathname+location.search)}catch(e){try{location.hash=id||''}catch(e2){}}show(id)}

function boot(){
  const keys=$id('keys');[1,2,3,4,5,6,7,8,9,0].forEach(n=>{const b=$('button','ck ab-key',keys,String(n));b.setAttribute('aria-label','Number '+n);b.addEventListener('click',()=>typeDigit(String(n)))});
  $id('clr').addEventListener('click',()=>{typed='';clearTimeout(typeT);beep(300,.05,'square',.03);led()});
  const hold=(b,d)=>{let iv=null,to=null;const stop=()=>{clearTimeout(to);clearInterval(iv)};b.addEventListener('pointerdown',e=>{e.preventDefault();step(d);stop();to=setTimeout(()=>{iv=setInterval(()=>step(d),150)},420)});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,stop));
    b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();step(d)}})};
  hold($id('prev'),-1);hold($id('next'),1);
  document.querySelectorAll('#home button').forEach(b=>b.addEventListener('mousedown',e=>e.preventDefault()));document.addEventListener('contextmenu',e=>{const t=e.target;if(t&&t.closest&&t.closest('#home,#game')&&!t.closest('input,textarea'))e.preventDefault()});document.addEventListener('selectstart',e=>{const t=e.target;if(t&&t.closest&&t.closest('#home,#game')&&!(t.closest&&t.closest('input,textarea')))e.preventDefault()});$id('start').addEventListener('click',startSel);$id('modeb').addEventListener('click',modeBack);{const bz=document.querySelector('.bz.b');if(bz)bz.textContent='ONLINE & OFFLINE \u00B7 '+NG+' GAMES'}$id('rej1').addEventListener('click',e=>eject(e.currentTarget));
  let sx=null;scr.addEventListener('pointerdown',e=>{sx={x:e.clientX}});scr.addEventListener('pointerup',e=>{if(!sx)return;const dx=e.clientX-sx.x;sx=null;if(Math.abs(dx)>36)step(dx<0?1:-1);else startSel()});
  window.addEventListener('keydown',e=>{if(el.home.hidden||e.metaKey||e.ctrlKey||e.altKey)return;const k=e.key,tg=e.target&&e.target.tagName;if(tg==='BUTTON'&&(k==='Enter'||k===' '))return;
    if(k==='ArrowRight'||k==='ArrowDown'){e.preventDefault();step(1)}else if(k==='ArrowLeft'||k==='ArrowUp'){e.preventDefault();step(-1)}
    else if(/^[0-9]$/.test(k))typeDigit(k);else if(k==='Enter'||k===' '){e.preventDefault();startSel()}else if(k==='Backspace'||k==='Escape'){if(typed){typed='';clearTimeout(typeT);led()}else modeBack()}else if(k==='m')modeBack()});
  const ms=()=>{[el.mute,$id('hmute')].forEach(b=>{b.setAttribute('aria-label',MUTED?'Sound off':'Sound on');b.classList.toggle('off',MUTED)})};ms();
  [el.mute,$id('hmute')].forEach(b=>b.addEventListener('click',()=>{MUTED=!MUTED;store.set('mute',MUTED);ms();if(!MUTED){unlockAudio();setTimeout(()=>SFX.tap(),30)}}));
  el.back.addEventListener('click',()=>{NET.close();nav('')});el.quit.addEventListener('click',()=>{NET.close();nav('')});el.again.addEventListener('click',()=>{if(!cur)return;if(cur.mp)mpRematch();else play(cur.game,cur.diff)});$id('odiff').addEventListener('click',()=>{if(cur)play(cur.game)});
  window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(id!==shown){if(cur&&cur.mp)NET.close();show(id)}});
  if(document.fonts&&document.fonts.load)document.fonts.load('10px "Press Start 2P"').catch(()=>{});
  show(location.hash.slice(1))}
boot();
if('serviceWorker' in navigator&&location.protocol==='https:'){const had=!!navigator.serviceWorker.controller;let reloading=false,pending=false;
  const reload=()=>{if(reloading)return;if(!el.home.hidden){reloading=true;location.reload()}else pending=true};
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had)reload()});
  window.addEventListener('hashchange',()=>{if(pending&&!el.home.hidden){pending=false;reload()}});
  window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>{r.update().catch(()=>{});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')r.update().catch(()=>{})})}).catch(()=>{})})}
</script>
</body>
</html>
