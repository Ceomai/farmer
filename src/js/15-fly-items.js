// ================= UÇAN ÜRÜNLER =================
function flyOne(x,y,emo,sel,delay=0){setTimeout(()=>{const tg=$(sel);if(!tg)return;const t=tg.getBoundingClientRect(),d=document.createElement('div');d.className='fly';d.textContent=emo;d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{d.style.transform=`translate(${t.left+16-x}px,${t.top+t.height/2-y}px) scale(.55)`;d.style.opacity='.5'}));
  setTimeout(()=>{d.remove();tg.classList.remove('bump');void tg.offsetWidth;tg.classList.add('bump')},700)},delay)}
function flyItems(x,y,out){let i=0;for(const [k,v] of Object.entries(out))for(let j=0;j<Math.min(v,4);j++)flyOne(x+(Math.random()-.5)*30,y,ITEMS[k].e,'#pStore',(i++)*70)}
function flyCoins(n=5){for(let i=0;i<n;i++)flyOne(lastP.x+(Math.random()-.5)*40,lastP.y,'🪙','#pCoin',i*60)}
