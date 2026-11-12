
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

function backdrop(t,col){const q=sg.createLinearGradient(0,0,0,240);q.addColorStop(0,'#05030d');q.addColorStop(.62,'#150a30');q.addColorStop(1,'#2a0f3c');sg.fillStyle=q;sg.fillRect(0,0,320,240);
  STARS.forEach(s=>{sg.fillStyle=`rgba(255,255,255,${(.2+.6*s.s)*(.6+.4*Math.sin(t*3+s.x))})`;sg.fillRect(s.x|0,s.y|0,1,1)});
  const hy=150;const hg=sg.createLinearGradient(0,hy-26,0,hy+2);hg.addColorStop(0,'rgba(0,0,0,0)');hg.addColorStop(1,col+'66');sg.fillStyle=hg;sg.fillRect(0,hy-26,320,28);
  sg.strokeStyle=col;sg.lineWidth=1;sg.globalAlpha=.32;for(let i=-9;i<=9;i++){sg.beginPath();sg.moveTo(160+i*11,hy);sg.lineTo(160+i*64,240);sg.stroke()}
  const off=(t*16)%14;for(let k=0;k<9;k++){const y=hy+Math.pow((k*14+off)/126,2)*90;sg.beginPath();sg.moveTo(0,y);sg.lineTo(320,y);sg.stroke()}sg.globalAlpha=1}

function screenContent(i,ox,t,zoom=0){const gm=GAMES[i],col=CATCOL[gm.cat];sg.save();sg.translate(ox,0);sg.textBaseline='alphabetic';
  sg.font=PS(8);sg.textAlign='left';sg.fillStyle='#a297c0';sg.fillText('GAME '+pad2(i+1)+'/'+NG,14,22);sg.textAlign='right';sg.fillStyle=col;sg.fillText(gm.cat.toUpperCase(),306,22);
  const sz=96*(1+zoom*.7),by=Math.sin(t*2.4)*3;sg.imageSmoothingEnabled=false;sg.shadowColor=col;sg.shadowBlur=22;sg.drawImage(gameIcon(gm.id),160-sz/2,94-sz/2+by,sz,sz);sg.shadowBlur=0;
  const nm=gm.name.toUpperCase();let fs=14;sg.font=PS(fs);while(fs>7&&sg.measureText(nm).width>292){fs--;sg.font=PS(fs)}
  sg.textAlign='center';sg.fillStyle='#000';sg.fillText(nm,161,173);sg.shadowColor=col;sg.shadowBlur=10;sg.fillStyle='#fff';sg.fillText(nm,160,172);sg.shadowBlur=0;
  const best=store.get('b_'+gm.id);sg.font=PS(7);sg.fillStyle='#ffd23f';sg.fillText(gm.ns?'2 PLAYER STYLE':best!=null?(gm.sl||'Score').toUpperCase()+' '+best:'NO SCORE YET',160,192);
  if(!zoom&&Math.floor(t*2.4)%2){sg.font=PS(10);sg.fillStyle=col;sg.fillText('PRESS START',160,222)}
  if(!zoom){const a=.4+.4*Math.sin(t*5);sg.globalAlpha=a;sg.fillStyle='#fff';sg.beginPath();sg.moveTo(10,94);sg.lineTo(18,86);sg.lineTo(18,102);sg.fill();sg.beginPath();sg.moveTo(310,94);sg.lineTo(302,86);sg.lineTo(302,102);sg.fill();sg.globalAlpha=1}
  sg.restore()}

function frame(now){raf=requestAnimationFrame(frame);const t=now/1000,dt=Math.min(.05,lastT?t-lastT:0);lastT=t;
  const col=CATCOL[GAMES[sel].cat];sg.setTransform(2,0,0,2,0,0);if(fx)fx.t+=dt;backdrop(t,col);
  if(fx&&fx.type==='change'){const k=Math.min(1,fx.t/.36);
    if(k<.3){screenContent(fx.from,-fx.dir*k*40,t);sg.globalAlpha=.55+.4*(k/.3);sg.drawImage(NZ[R(4)],0,0,320,240);sg.globalAlpha=1}
    else{const p=(k-.3)/.7,e=1-Math.pow(1-p,3);screenContent(sel,fx.dir*(1-e)*320,t);sg.globalAlpha=(1-p)*.6;sg.drawImage(NZ[R(4)],0,0,320,240);sg.globalAlpha=1;
      if(p<.85){sg.setTransform(1,0,0,1,0,0);for(let b=0;b<3;b++){const y=R(460),h=6+R(26);sg.drawImage(scr,0,y,640,h,(Math.random()-.5)*50,y,640,h)}sg.setTransform(2,0,0,2,0,0)}
      sg.globalCompositeOperation='lighter';sg.globalAlpha=(1-p)*.35;sg.fillStyle=col;sg.fillRect(0,0,320,240);sg.globalCompositeOperation='source-over';sg.globalAlpha=1}
    if(k>=1)fx=null}
  else if(fx&&fx.type==='select'){const k=fx.t;screenContent(sel,0,t,Math.min(1,k/.9));sg.fillStyle=`rgba(0,0,0,${Math.min(.6,k*1.4)})`;sg.fillRect(0,0,320,240);
    if(k>.16){sg.textAlign='center';if(Math.floor(k*8)%2===0){sg.font=PS(18);sg.fillStyle='#000';sg.fillText('PLAYER 1',162,98);sg.shadowColor='#ffd23f';sg.shadowBlur=14;sg.fillStyle='#ffd23f';sg.fillText('PLAYER 1',160,96);sg.shadowBlur=0}
      sg.font=PS(11);sg.fillStyle='#fff';sg.fillText('GET READY!',160,128);sg.font=PS(7);sg.fillStyle=col;sg.fillText(GAMES[sel].name.toUpperCase(),160,150)}
    if(k<.15){sg.fillStyle=`rgba(255,255,255,${1-k/.15})`;sg.fillRect(0,0,320,240)}
    if(k>.95){sg.fillStyle=`rgba(255,255,255,${Math.min(1,(k-.95)*4)})`;sg.fillRect(0,0,320,240)}}
  else if(fx&&fx.type==='on'){const k=Math.min(1,fx.t/.5),e=k<.35?0:1-Math.pow(1-(k-.35)/.65,3),h=Math.max(2,240*e);screenContent(sel,0,t);
    sg.fillStyle='#000';sg.fillRect(0,0,320,(240-h)/2);sg.fillRect(0,(240+h)/2,320,240);
    if(k<.35){const w=320*Math.min(1,k/.25);sg.fillStyle='#fff';sg.shadowColor='#bfe8ff';sg.shadowBlur=12;sg.fillRect(160-w/2,119,w,2);sg.shadowBlur=0}
    else{sg.fillStyle=`rgba(255,255,255,${(1-e)*.6})`;sg.fillRect(0,(240-h)/2,320,h)}
    if(k>=1)fx=null}
  else screenContent(sel,0,t);
  sg.setTransform(1,0,0,1,0,0);sg.drawImage(OV,0,0)}

const sfxChange=()=>{noise(.16,.12,0,2600);beep(880,.05,'square',.035);beep(1320,.06,'square',.03,.07)};
const sfxOn=()=>{beep(70,.35,'sawtooth',.05,0,900);noise(.3,.06,.05,5000)};
const sfxSelect=()=>{noise(.05,.15,0,4500);beep(988,.07,'square',.05,.02);beep(1319,.32,'square',.05,.1);[523,659,784,1047,784,1047,1319].forEach((f,i)=>beep(f,.085,'square',.045,.46+i*.075))};
function led(){const L=$id('led');L.classList.toggle('typing',!!typed);L.textContent=typed?(typed.length===1?typed+'_':typed):pad2(sel+1)}
function announce(){$id('sr').textContent='Game '+(sel+1)+' of '+NG+': '+GAMES[sel].name+', '+GAMES[sel].cat}
function press(b){if(!b)return;b.classList.add('down');setTimeout(()=>b.classList.remove('down'),110)}
function tilt(d){const s=$id('stick');s.classList.remove('l','r');s.classList.add(d>0?'r':'l');clearTimeout(tilt.t);tilt.t=setTimeout(()=>s.classList.remove('l','r'),170)}
function go(i,dir){if(i===sel||busy)return;fx={type:'change',t:0,dir,from:sel};sel=i;store.set('sel',sel);sfxChange();led();announce()}
function step(d){if(busy)return;typed='';clearTimeout(typeT);tilt(d);go((sel+d+NG)%NG,d)}
function commit(){clearTimeout(typeT);if(!typed)return;const n=+typed;typed='';if(n>=1&&n<=NG){if(n-1===sel){led();beep(660,.05,'square',.03);return}go(n-1,n-1>sel?1:-1)}else{SFX.bad();const L=$id('led');L.textContent='ER';L.classList.remove('err');void L.offsetWidth;L.classList.add('err');setTimeout(led,700);return}led()}
function typeDigit(d){if(busy)return;typed=(typed+d).slice(-2);if(typed==='0'){typed='';SFX.bad();return led()}beep(500+(+d)*45,.04,'square',.035);led();clearTimeout(typeT);
  if(typed.length===2||+typed*10>NG)commit();else typeT=setTimeout(commit,1000)}
function startSel(){if(busy)return;if(typed){commit();return}busy=true;press($id('start'));fx={type:'select',t:0};sfxSelect();
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(()=>{if(reduce)return;noise(.45,.07,0,700);beep(180,.45,'sawtooth',.035,0,1800);const cab=$id('cab'),c=cab.getBoundingClientRect(),s=scr.getBoundingClientRect();cab.style.transformOrigin=`${s.left-c.left+s.width/2}px ${s.top-c.top+s.height/2}px`;cab.classList.add('zoom')},900);
  setTimeout(()=>{nav(GAMES[sel].id);$id('cab').classList.remove('zoom');busy=false},1400)}

function show(id){const gm=GAMES.find(x=>x.id===id);shown=gm?id:'';if(gm){const i=GAMES.indexOf(gm);if(i!==sel){sel=i;store.set('sel',sel)}cancelAnimationFrame(raf);raf=0;play(gm)}
  else{stopGame();el.game.hidden=true;el.home.hidden=false;fx={type:'on',t:0};sfxOn();led();announce();if(!raf){lastT=0;raf=requestAnimationFrame(frame)}}}
function nav(id){try{if(id)location.hash=id;else history.replaceState(null,'',location.pathname+location.search)}catch(e){try{location.hash=id||''}catch(e2){}}show(id)}

function boot(){
  const keys=$id('keys');[1,2,3,4,5,6,7,8,9,0].forEach(n=>{const b=$('button','ab ab-key',keys,String(n));b.setAttribute('aria-label','Number '+n);b.addEventListener('click',()=>typeDigit(String(n)))});
  $id('clr').addEventListener('click',()=>{typed='';clearTimeout(typeT);beep(300,.05,'square',.03);led()});
  const hold=(b,d)=>{let iv=null,to=null;const stop=()=>{clearTimeout(to);clearInterval(iv)};b.addEventListener('pointerdown',e=>{e.preventDefault();step(d);stop();to=setTimeout(()=>{iv=setInterval(()=>step(d),150)},420)});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,stop));
    b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();step(d)}})};
  hold($id('prev'),-1);hold($id('next'),1);
  $id('start').addEventListener('click',startSel);
  let sx=null;scr.addEventListener('pointerdown',e=>{sx={x:e.clientX}});scr.addEventListener('pointerup',e=>{if(!sx)return;const dx=e.clientX-sx.x;sx=null;if(Math.abs(dx)>36)step(dx<0?1:-1);else startSel()});
  window.addEventListener('keydown',e=>{if(el.home.hidden||e.metaKey||e.ctrlKey||e.altKey)return;const k=e.key,tg=e.target&&e.target.tagName;if(tg==='BUTTON'&&(k==='Enter'||k===' '))return;
    if(k==='ArrowRight'||k==='ArrowDown'){e.preventDefault();step(1)}else if(k==='ArrowLeft'||k==='ArrowUp'){e.preventDefault();step(-1)}
    else if(/^[0-9]$/.test(k))typeDigit(k);else if(k==='Enter'||k===' '){e.preventDefault();startSel()}else if(k==='Backspace'||k==='Escape'){typed='';clearTimeout(typeT);led()}});
  const ms=()=>{[el.mute,$id('hmute')].forEach(b=>{b.innerHTML=MUTED?'&#128263;':'&#128266;';b.setAttribute('aria-label',MUTED?'Sound off':'Sound on')})};ms();
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
