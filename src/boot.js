
/* ---------- Spazzy's Arcade: cabinet launcher ---------- */
const CATCOL={'Arcade':'#ff4d6d','Puzzle':'#ffd23f','Board':'#2ee6b6','Words & Math':'#4cc9f0','Cards & Reflex':'#ff7ac6'};
const $id=i=>document.getElementById(i);
const scr=$id('scr'),sg=scr.getContext('2d');scr.width=640;scr.height=480;
const PS=n=>n+'px "Press Start 2P",monospace',pad2=n=>String(n).padStart(2,'0');
const NG=GAMES.length;
let sel=clamp(+store.get('sel')||0,0,NG-1),shown=null,fx=null,typed='',typeT=null,busy=false,raf=0,lastT=0;
const NZ=[0,1,2,3].map(()=>{const c=document.createElement('canvas');c.width=160;c.height=120;const x=c.getContext('2d'),d=x.createImageData(160,120);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);return c});
const OV=(()=>{const c=document.createElement('canvas');c.width=640;c.height=480;const x=c.getContext('2d');x.fillStyle='rgba(0,0,0,.24)';for(let y=0;y<480;y+=4)x.fillRect(0,y,640,2);const v=x.createRadialGradient(320,240,150,320,240,430);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.72)');x.fillStyle=v;x.fillRect(0,0,640,480);return c})();
const STARS=Array.from({length:44},()=>({x:Math.random()*320,y:Math.random()*140,s:Math.random()}));

let credits=0;
function backdrop(t){sg.fillStyle='#000';sg.fillRect(0,0,320,240);STARS.forEach(s=>{if(s.s<.55)return;sg.fillStyle=(Math.floor(t*2+s.x)%3)?'#3a3a52':'#6a6a8a';sg.fillRect(s.x|0,(s.y*1.6)|0,1,1)})}
const TXT=(t,x,y,c,n=8,al='center')=>{sg.font=PS(n);sg.textAlign=al;sg.fillStyle=c;sg.fillText(t,x|0,y|0)};
function screenContent(i,ox,t,zoom=0){const gm=GAMES[i],col=CATCOL[gm.cat];sg.save();sg.translate(ox|0,0);sg.textBaseline='alphabetic';
  TXT('GAME',14,16,'#ff2a2a',8,'left');TXT(pad2(i+1)+'/'+NG,14,28,'#f4f4f4',8,'left');
  const best=store.get('b_'+gm.id);TXT('HI-SCORE',160,16,'#ff2a2a');TXT(gm.ns?'------':best!=null?String(best):'000000',160,28,'#f4f4f4');
  TXT('TYPE',306,16,'#ff2a2a',8,'right');TXT(gm.cat.split(' ')[0].toUpperCase(),306,28,col,8,'right');
  const sz=Math.round(96*(1+zoom*.7)/32)*32||96;sg.imageSmoothingEnabled=false;sg.drawImage(gameIcon(gm.id),160-sz/2|0,(100-sz/2)|0,sz,sz);
  const nm=gm.name.toUpperCase();let fs=14;sg.font=PS(fs);while(fs>7&&sg.measureText(nm).width>292){fs--;sg.font=PS(fs)}TXT(nm,160,174,'#ffd23f',fs);
  if(!zoom){if(Math.floor(t*1.6)%2)TXT('PUSH START BUTTON',160,200,'#f4f4f4',8);
    sg.fillStyle='#f4f4f4';const ar=Math.floor(t*3)%2?1:0;sg.fillRect(8+ar,98,2,2);sg.fillRect(10+ar,96,2,6);sg.fillRect(12+ar,94,2,10);sg.fillRect(308-ar,98,2,2);sg.fillRect(306-ar,96,2,6);sg.fillRect(304-ar,94,2,10)}
  sg.restore();TXT('CREDIT '+pad2(credits),14,230,'#f4f4f4',7,'left');TXT('©SPAZZY',306,230,'#6a6a8a',7,'right')}

function frame(now){raf=requestAnimationFrame(frame);const t=now/1000,dt=Math.min(.05,lastT?t-lastT:0);lastT=t;
  sg.setTransform(2,0,0,2,0,0);if(fx)fx.t+=dt;backdrop(t);
  if(fx&&fx.type==='change'){const k=Math.min(1,fx.t/.36);
    if(k<.3){screenContent(fx.from,-fx.dir*k*40,t);sg.globalAlpha=.55+.4*(k/.3);sg.drawImage(NZ[R(4)],0,0,320,240);sg.globalAlpha=1}
    else{const p=(k-.3)/.7,e=1-Math.pow(1-p,3);screenContent(sel,fx.dir*(1-e)*320,t);sg.globalAlpha=(1-p)*.6;sg.drawImage(NZ[R(4)],0,0,320,240);sg.globalAlpha=1;
      if(p<.85){sg.setTransform(1,0,0,1,0,0);for(let b=0;b<3;b++){const y=R(460),h=6+R(26);sg.drawImage(scr,0,y,640,h,(Math.random()-.5)*50,y,640,h)}sg.setTransform(2,0,0,2,0,0)}}
    if(k>=1)fx=null}
  else if(fx&&fx.type==='select'){const k=fx.t;screenContent(sel,0,t,Math.min(1,k/.9));sg.fillStyle=`rgba(0,0,0,${Math.min(.7,k*1.6)})`;sg.fillRect(0,0,320,240);
    if(k>.16){if(Math.floor(k*8)%2===0)TXT('PLAYER 1',160,98,'#ff2a2a',18);TXT('GET READY',160,128,'#f4f4f4',11);TXT(GAMES[sel].name.toUpperCase(),160,150,'#ffd23f',7)}
    if(k<.12){sg.fillStyle='#fff';sg.globalAlpha=1-k/.12;sg.fillRect(0,0,320,240);sg.globalAlpha=1}
    if(k>.95){sg.fillStyle='#fff';sg.globalAlpha=Math.min(1,(k-.95)*4);sg.fillRect(0,0,320,240);sg.globalAlpha=1}}
  else if(fx&&fx.type==='on'){const k=Math.min(1,fx.t/.5),e=k<.35?0:1-Math.pow(1-(k-.35)/.65,3),h=Math.max(2,240*e);screenContent(sel,0,t);
    sg.fillStyle='#000';sg.fillRect(0,0,320,(240-h)/2);sg.fillRect(0,(240+h)/2,320,240);
    if(k<.35){const w=320*Math.min(1,k/.25);sg.fillStyle='#fff';sg.fillRect(160-w/2,119,w,2)}else{sg.fillStyle=`rgba(255,255,255,${(1-e)*.6})`;sg.fillRect(0,(240-h)/2,320,h)}
    if(k>=1)fx=null}
  else screenContent(sel,0,t);
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
  if(!cab.animate||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const c=cab.getBoundingClientRect(),s2=slit.getBoundingClientRect(),r2=ret.getBoundingClientRect();
  const x=s2.left-c.left+s2.width/2,y0=s2.top-c.top+s2.height*.7,y1=r2.top-c.top+r2.height/2;const k=$('div','ejectc',cab);
  const an=k.animate([{transform:`translate(${x}px,${y0}px) scale(.2,.6)`,opacity:0},{transform:`translate(${x}px,${y0+4}px) scale(.9)`,opacity:1,offset:.2},{transform:`translate(${x}px,${y1}px) scale(.9)`,opacity:1,offset:.55},{transform:`translate(${x}px,${y1-5}px) scale(.9)`,offset:.68},{transform:`translate(${x}px,${y1}px) scale(.9)`,opacity:1,offset:.8},{transform:`translate(${x}px,${y1+2}px) scale(.7,.4)`,opacity:0}],{duration:700,easing:'ease-in',fill:'forwards'});
  an.onfinish=()=>k.remove()}
function led(){const L=$id('led');L.classList.toggle('typing',!!typed);L.textContent=typed?(typed.length===1?typed+'_':typed):pad2(sel+1)}
function announce(){$id('sr').textContent='Game '+(sel+1)+' of '+NG+': '+GAMES[sel].name+', '+GAMES[sel].cat}
function press(b){if(!b)return;b.classList.add('down');setTimeout(()=>b.classList.remove('down'),110)}
function tilt(d){const s=$id('stick');s.classList.remove('l','r');s.classList.add(d>0?'r':'l');clearTimeout(tilt.t);tilt.t=setTimeout(()=>s.classList.remove('l','r'),170)}
function go(i,dir){if(i===sel||busy)return;fx={type:'change',t:0,dir,from:sel};sel=i;store.set('sel',sel);sfxChange();led();announce()}
function step(d){if(busy)return;typed='';clearTimeout(typeT);tilt(d);go((sel+d+NG)%NG,d)}
function commit(){clearTimeout(typeT);if(!typed)return;const n=+typed;typed='';if(n>=1&&n<=NG){if(n-1===sel){led();beep(660,.05,'square',.03);return}go(n-1,n-1>sel?1:-1)}else{SFX.bad();const L=$id('led');L.textContent='ER';L.classList.remove('err');void L.offsetWidth;L.classList.add('err');setTimeout(led,700);return}led()}
function typeDigit(d){if(busy)return;typed=(typed+d).slice(-2);if(typed==='0'){typed='';SFX.bad();return led()}beep(500+(+d)*45,.04,'square',.035);led();clearTimeout(typeT);
  if(typed.length===2||+typed*10>NG)commit();else typeT=setTimeout(commit,1000)}
function startSel(){if(busy)return;if(typed){commit();return}busy=true;press($id('start'));
  coinDrop(()=>{fx={type:'select',t:0};sfxSelect();const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(()=>{if(reduce)return;noise(.45,.07,0,700);beep(180,.45,'sawtooth',.035,0,1800);const cab=$id('cab'),c=cab.getBoundingClientRect(),s=scr.getBoundingClientRect();cab.style.transformOrigin=`${s.left-c.left+s.width/2}px ${s.top-c.top+s.height/2}px`;cab.classList.add('zoom')},900);
    setTimeout(()=>{nav(GAMES[sel].id);$id('cab').classList.remove('zoom');credits=0;busy=false},1400)})}

function show(id){const gm=GAMES.find(x=>x.id===id);shown=gm?id:'';if(gm){const i=GAMES.indexOf(gm);if(i!==sel){sel=i;store.set('sel',sel)}cancelAnimationFrame(raf);raf=0;play(gm)}
  else{stopGame();el.game.hidden=true;el.home.hidden=false;fx={type:'on',t:0};sfxOn();led();announce();if(!raf){lastT=0;raf=requestAnimationFrame(frame)}}}
function nav(id){try{if(id)location.hash=id;else history.replaceState(null,'',location.pathname+location.search)}catch(e){try{location.hash=id||''}catch(e2){}}show(id)}

function boot(){
  const keys=$id('keys');[1,2,3,4,5,6,7,8,9,0].forEach(n=>{const b=$('button','ck ab-key',keys,String(n));b.setAttribute('aria-label','Number '+n);b.addEventListener('click',()=>typeDigit(String(n)))});
  $id('clr').addEventListener('click',()=>{typed='';clearTimeout(typeT);beep(300,.05,'square',.03);led()});
  const hold=(b,d)=>{let iv=null,to=null;const stop=()=>{clearTimeout(to);clearInterval(iv)};b.addEventListener('pointerdown',e=>{e.preventDefault();step(d);stop();to=setTimeout(()=>{iv=setInterval(()=>step(d),150)},420)});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,stop));
    b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();step(d)}})};
  hold($id('prev'),-1);hold($id('next'),1);
  $id('start').addEventListener('click',startSel);$id('rej1').addEventListener('click',e=>eject(e.currentTarget));
  let sx=null;scr.addEventListener('pointerdown',e=>{sx={x:e.clientX}});scr.addEventListener('pointerup',e=>{if(!sx)return;const dx=e.clientX-sx.x;sx=null;if(Math.abs(dx)>36)step(dx<0?1:-1);else startSel()});
  window.addEventListener('keydown',e=>{if(el.home.hidden||e.metaKey||e.ctrlKey||e.altKey)return;const k=e.key,tg=e.target&&e.target.tagName;if(tg==='BUTTON'&&(k==='Enter'||k===' '))return;
    if(k==='ArrowRight'||k==='ArrowDown'){e.preventDefault();step(1)}else if(k==='ArrowLeft'||k==='ArrowUp'){e.preventDefault();step(-1)}
    else if(/^[0-9]$/.test(k))typeDigit(k);else if(k==='Enter'||k===' '){e.preventDefault();startSel()}else if(k==='Backspace'||k==='Escape'){typed='';clearTimeout(typeT);led()}});
  const ms=()=>{el.mute.innerHTML=MUTED?'&#128263;':'&#128266;';[el.mute,$id('hmute')].forEach(b=>b.setAttribute('aria-label',MUTED?'Sound off':'Sound on'));$id('hmute').classList.toggle('off',MUTED)};ms();
  [el.mute,$id('hmute')].forEach(b=>b.addEventListener('click',()=>{MUTED=!MUTED;store.set('mute',MUTED);ms();if(!MUTED){unlockAudio();setTimeout(()=>SFX.tap(),30)}}));
  el.back.addEventListener('click',()=>nav(''));el.quit.addEventListener('click',()=>nav(''));el.again.addEventListener('click',()=>{if(cur)play(cur.game)});
  window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(id!==shown)show(id)});
  if(document.fonts&&document.fonts.load)document.fonts.load('10px "Press Start 2P"').catch(()=>{});
  show(location.hash.slice(1))}
boot();
if('serviceWorker' in navigator&&location.protocol==='https:'){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}
</script>
</body>
</html>
