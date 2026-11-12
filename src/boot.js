
/* ---------- launcher ---------- */
let filt='All',shown=null;
function renderShelf(){const q=el.q.value.trim().toLowerCase();el.shelf.textContent='';let n=0;
  GAMES.forEach((gm,i)=>{if(filt!=='All'&&gm.cat!==filt)return;if(q&&!(gm.name+' '+gm.cat).toLowerCase().includes(q))return;n++;
    const b=$('button','cart',el.shelf);b.style.setProperty('--k',`var(${CATVAR[gm.cat]})`);$('span','no',b,String(i+1).padStart(2,'0'));$('span','nm',b,gm.name);$('span','ct',b,gm.cat);
    const best=store.get('b_'+gm.id);if(best!=null&&!gm.ns)$('span','bs',b,'Best '+best);b.addEventListener('click',()=>nav(gm.id))});
  if(!n)$('p','none',el.shelf,'No games match that. Clear the search to see all '+GAMES.length+'.')}
function show(id){const gm=GAMES.find(x=>x.id===id);shown=gm?id:'';if(gm)play(gm);else{stopGame();el.game.hidden=true;el.home.hidden=false;renderShelf()}}
function nav(id){try{if(id)location.hash=id;else history.replaceState(null,'',location.pathname+location.search)}catch(e){try{location.hash=id||''}catch(e2){}}show(id)}
function boot(){el.tag.textContent=GAMES.length+' games in one app. Pick a cartridge and play, on your phone or at a keyboard.';
  ['All',...CATS].forEach(c=>{const b=$('button','chip',el.chips,c);b.setAttribute('aria-pressed',c===filt);b.addEventListener('click',()=>{filt=c;[...el.chips.children].forEach(x=>x.setAttribute('aria-pressed',x===b));renderShelf()})});
  el.q.addEventListener('input',renderShelf);el.rand.addEventListener('click',()=>nav(GAMES[R(GAMES.length)].id));
  el.back.addEventListener('click',()=>nav(''));el.quit.addEventListener('click',()=>nav(''));el.again.addEventListener('click',()=>{if(cur)play(cur.game)});
  window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(id!==shown)show(id)});
  show(location.hash.slice(1))}
boot();
if('serviceWorker' in navigator&&location.protocol==='https:'){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}
</script>
</body>
</html>
