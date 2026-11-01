// ================= SÖZLEŞMELER =================
function genContract(){const pool=producible().filter(k=>ITEMS[k].p>=8);const k=pool[Math.floor(Math.random()*pool.length)]||'misir';const total=Math.max(5,Math.min(60,Math.round(500/ITEMS[k].p)));const hrs=6+Math.floor(Math.random()*13);
  return{who:NAMES[Math.floor(Math.random()*NAMES.length)],k,total,got:0,until:now()+hrs*3600000,reward:Math.round(ITEMS[k].p*total*2.2),xp:Math.round(20+ITEMS[k].p*total/15),gems:1}}
function ensureContracts(){const n=S.contracts.length;S.contracts=S.contracts.filter(c=>now()<c.until);while(S.contracts.length<2)S.contracts.push(genContract());return n!==S.contracts.length}
function deliverContract(i){const c=S.contracts[i];if(!c)return;const n=Math.min(has(c.k),c.total-c.got);if(n<=0)return toast('Elinde bu üründen yok');S.items[c.k]-=n;c.got+=n;
  if(c.got>=c.total){befriend(c.who,3);const r=Math.round(c.reward*repMult()*frMult(c.who)*(projOn('kopru')?1.15:1));gain(r,'Sözleşme');addXP(c.xp);S.gems+=c.gems;S.rep=Math.min(100,S.rep+2);stat('contracts');S.contracts.splice(i,1,genContract());sfx('win');flyCoins(8);toast(`Sözleşme tamam! +₺${fmt(r)} +🍀${c.gems}`)}
  else{sfx('pop');toast(`${n} ${ITEMS[c.k].n} teslim edildi`)}commit()}
const FACES={'Kasap Rıza':'🧔','Fırıncı Nuri':'👨‍🍳','Lokantacı Sevim':'👩‍🍳','Manav Hilmi':'👴','Otelci Gülten':'👩‍💼','Kooperatif':'🧑‍🌾','Bakkal Ahmet':'🧑','Konakçı Halit Bey':'🎩','Pazarcı Zehra':'👵'};
const face=n=>FACES[n]||'🧑';
function contractsBody(){ensureContracts();return `<p class="note">Uzun vadeli tedarik: parça parça teslim et, sonunda büyük ödül al.</p>`+S.contracts.map((c,i)=>`<div class="order"><div class="who">${face(c.who)} ${c.who}<span>₺${fmt(c.reward*repMult())} · 🍀${c.gems}</span></div>
  <div class="meterbar"><span style="font-size:22px">${ITEMS[c.k].e}</span><span class="pbar"><i style="width:${c.got/c.total*100}%;animation:none"></i></span><b>${c.got}/${c.total}</b></div>
  <div class="urow"><button class="pill-btn gold" data-act="contract" data-i="${i}" ${has(c.k)?'':'disabled'}>📦 Teslim et (${Math.min(has(c.k),c.total-c.got)})</button><small class="tm" data-left="${c.until}" data-pre="⏳"></small></div></div>`).join('')}
