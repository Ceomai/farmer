// ================= HASAT KUTLAMASI =================
let celebT=0;
function celebrate(txt){if(now()-celebT<4000)return;celebT=now();sfx('win');const st=$('#stage');st.classList.remove('shake');void st.offsetWidth;st.classList.add('shake');
  const w=document.createElement('div');w.className='celeb';w.innerHTML=`<b>${txt||'Bereketli!'}</b>`;document.body.appendChild(w);
  const cols=['#c4492e','#f2b330','#5aa047','#3f6fa0','#e8657a','#fff6e0'];for(let i=0;i<46;i++){const c=document.createElement('i');c.className='conf';c.style.left=(50+(Math.random()-.5)*20)+'%';c.style.background=cols[i%cols.length];
    c.style.setProperty('--dx',((Math.random()-.5)*110)+'vw');c.style.setProperty('--dy',(-30-Math.random()*45)+'vh');c.style.setProperty('--r',(Math.random()*900-450)+'deg');c.style.animationDelay=(Math.random()*.12)+'s';document.body.appendChild(c);setTimeout(()=>c.remove(),1900)}
  setTimeout(()=>w.remove(),1700);PLATFORM.hap('heavy')}
