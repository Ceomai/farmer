// ================= UÇAN ÜRÜNLER =================
// Uçuş süresi mesafeye göre 250–450 ms; hareketi azaltta uçuş yok, yalnızca hedef pil tepki verir
function flyOne(x,y,emo,sel,delay=0){setTimeout(()=>{const tg=$(sel);if(!tg)return;const bump=()=>{tg.classList.remove('bump');void tg.offsetWidth;tg.classList.add('bump')};if(RM())return bump();
  const t=tg.getBoundingClientRect(),dx=t.left+16-x,dy=t.top+t.height/2-y,ms=Math.round(Math.max(250,Math.min(450,250+Math.hypot(dx,dy)*.3))),d=document.createElement('div');d.className='fly';d.textContent=emo;d.style.left=x+'px';d.style.top=y+'px';d.style.transitionDuration=ms+'ms';document.body.appendChild(d);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{d.style.transform=`translate(${dx}px,${dy}px) scale(.55)`;d.style.opacity='.5'}));
  setTimeout(()=>{d.remove();bump()},ms+30)},delay)}
function flyItems(x,y,out){let i=0;for(const [k,v] of Object.entries(out))for(let j=0;j<Math.min(v,4);j++)flyOne(x+(Math.random()-.5)*30,y,ITEMS[k].e,'#pStore',(i++)*70)}
function flyCoins(n=5){for(let i=0;i<n;i++)flyOne(lastP.x+(Math.random()-.5)*40,lastP.y,'🪙','#pCoin',i*60)}
