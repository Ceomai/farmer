// Çiftlik İmparatorluğu derleme betiği
// src/ altındaki şablonu, CSS'i ve JS modüllerini tek bir çevrimdışı çalışan dist/index.html dosyasında birleştirir.
// - three.js ve OrbitControls node_modules'tan gömülür (internet gerekmez)
// - Google yazı tipleri ve oyunda geçen emojilerin renkli font alt kümesi base64 olarak gömülür
//   (--no-fonts ile atlanır; o zaman Google Fonts bağlantısı kullanılır)
import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import crypto from 'node:crypto';
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');const src=p=>path.join(root,'src',p);
const args=new Set(process.argv.slice(2));const withFonts=!args.has('--no-fonts');
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const cacheDir=path.join(root,'.font-cache');fs.mkdirSync(cacheDir,{recursive:true});
function get(url,bin){const key=crypto.createHash('sha1').update(url).digest('hex');const f=path.join(cacheDir,key);
  if(!fs.existsSync(f))execFileSync('curl',['-sSfL','-A',UA,'-o',f,url]);return bin?fs.readFileSync(f):fs.readFileSync(f,'utf8')}
async function inlineCss(cssUrl,keep){let css=get(cssUrl);
  if(keep)css=css.split(/(?=\/\*[^*]+\*\/\s*@font-face)/).filter(b=>{const m=b.match(/^\/\*\s*([^*]+?)\s*\*\//);return !m||keep.includes(m[1])}).join('');
  return css.replace(/url\((https:[^)]+)\)/g,(m,u)=>`url(data:font/woff2;base64,${get(u,true).toString('base64')})`)}
const order=fs.readFileSync(src('js/ORDER'),'utf8').trim().split('\n').filter(Boolean);
const js=order.map(f=>`// ---- ${f} ----\n`+fs.readFileSync(src('js/'+f),'utf8')).join('\n');
let css=fs.readFileSync(src('styles/game.css'),'utf8');let html=fs.readFileSync(src('index.template.html'),'utf8');
const vendor=['three/build/three.min.js','three/examples/js/controls/OrbitControls.js'].map(p=>`<script>\n${fs.readFileSync(path.join(root,'node_modules',p),'utf8')}\n</script>`).join('\n');
const fontLink=/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com[^"]+)">/;
if(withFonts){const m=html.match(fontLink);let fcss=await inlineCss(m[1].replace(/&amp;/g,'&'),['latin','latin-ext']);
  // Oyunda geçen tüm emojiler: her telefonda aynı görünsün diye Noto Color Emoji alt kümesi
  const all=js+html;const emo=[...new Set(all.match(/\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*/gu)||[])].join('');
  const ecss=(await inlineCss('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&text='+encodeURIComponent(emo+'️‍'))).replace(/font-family: 'Noto Color Emoji'/g,"font-family: 'CE Emoji'").replace(/body\s*\{[^}]*\}/g,'');
  html=html.replace(/<link rel="preconnect"[^>]*>\n?/,'').replace(fontLink,'');
  css=fcss+'\n@supports font-tech(color-COLRv1){'+ecss+'}\n'+css;console.log(`yazı tipleri gömüldü · ${[...emo].length} emoji karakteri`)}
html=html.replace('/*@@STYLE@@*/',()=>css).replace('<!--@@VENDOR@@-->',()=>vendor).replace('/*@@SCRIPTS@@*/',()=>js);
html='<meta charset="utf-8">\n'+html;
fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist/index.html'),html);
// Uygulama (Capacitor) için tam HTML belgesi
const doc='<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n<meta name="theme-color" content="#7a3f22">\n<style>:root{padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}html,body{margin:0;-webkit-tap-highlight-color:transparent;overscroll-behavior:none}body{font-size:14px}img{max-width:100%}[hidden]{display:none!important}</style>\n</head>\n<body>\n'+html.replace(/<meta name="claude:[^>]*>\n?/,'')+'\n</body>\n</html>\n';
// Capacitor web dizini
fs.mkdirSync(path.join(root,'www'),{recursive:true});fs.writeFileSync(path.join(root,'www/index.html'),doc);
if(fs.existsSync(path.join(root,'public')))for(const f of fs.readdirSync(path.join(root,'public'),{withFileTypes:true}).filter(d=>d.isFile()&&d.name!=='.gitkeep'))fs.copyFileSync(path.join(root,'public',f.name),path.join(root,'www',f.name));
console.log(`dist/index.html · ${(html.length/1024).toFixed(0)} KB`);
