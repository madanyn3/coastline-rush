import {createCarPreview} from './car-visuals.js';
import {CARS,carStats} from './progression.js';
import {appearanceFor} from './customization.js';
import {carCredits} from './car-credits.js';

const node=(tag,cls,text)=>{const e=document.createElement(tag);e.className=cls||'';if(text!==undefined)e.textContent=text;return e;};
const copy={garage:['01 / THE PADDOCK','YOUR GARAGE','Pick your machine. Make it yours.'],worlds:['02 / CHANGE THE ATMOSPHERE','GAME WORLDS','Same road. A whole new feeling.'],routes:['03 / FIND YOUR LINE','THE ROUTES','From the waterfront to the skyline.'],missions:['04 / SOMETHING TO CHASE','RACE MISSIONS','Push your limits. Build your balance.'],history:['05 / YOUR TRACK RECORD','RUN HISTORY','Every finish has a story.'],upgrades:['GARAGE / PERFORMANCE','PERFORMANCE','Build a machine that keeps up with you.'],customize:['GARAGE / PERSONALIZE','MAKE IT YOURS','Your car. Your signature.']};
export function collectionHeading(tab,profile,saveOK){
 const root=document.getElementById('collection'),info=copy[tab]||copy.garage;
 root.dataset.tab=tab;root.classList.toggle('deck-mode',['garage','worlds','routes'].includes(tab));
 document.getElementById('collection-kicker').textContent=info[0];
 document.getElementById('collection-description').textContent=info[2];
 document.getElementById('collection-balance').textContent=profile.wallet.toLocaleString();
 document.getElementById('collection-subtitle').textContent=info[1];
 document.getElementById('save-note').textContent=saveOK?'PROGRESS SAVED ON THIS DEVICE':'SAVING UNAVAILABLE';
 for(const b of root.querySelectorAll('[data-collection-tab]'))b.setAttribute('aria-current',(b.dataset.collectionTab===(tab==='upgrades'||tab==='customize'?'garage':tab))?'page':'false');
 if(!root.contains(document.activeElement))document.getElementById('collection-close').focus({preventScroll:true});
}
export function garageHero(body,profile){
 const spec=CARS.find(c=>c.id===profile.car)||CARS[0],stats=carStats(profile),hero=node('section','garage-showcase'),info=node('div','showcase-copy');
 info.append(node('span','card-kicker','CURRENTLY EQUIPPED'),node('h3','',spec.name),node('p','',spec.tagline||(spec.style==='classic'?'Old-school soul. Open-road spirit.':spec.style==='sport'?'Light on its feet. Quick off the line.':'Built for speed. Ready for the night.')));
 const metrics=node('div','showcase-metrics');for(const [value,label] of [[spec.max,'KM/H'],[Math.round(stats.acceleration),'ACCEL'],[stats.upgradeCount+'/12','BUILD']]){const item=node('div');item.append(node('strong','',String(value)),node('small','',label));metrics.append(item);}info.append(metrics);
 const stage=node('div','showcase-stage'),canvas=node('canvas','garage-preview'),label=node('small','preview-state','LOADING YOUR CAR');canvas.setAttribute('aria-label','Equipped '+spec.name+' 3D preview');stage.append(node('span','stage-number','01'),canvas,label);hero.append(info,stage);body.append(hero);
 let closed=false,preview;createCarPreview(canvas,spec,appearanceFor(profile),{zoom:1.65}).then(p=>{if(closed){p.dispose();return;}preview=p;label.textContent='YOUR BUILD / LIVE 3D';}).catch(()=>{label.textContent='PREVIEW UNAVAILABLE';stage.classList.add('preview-failed');});
 carCredits(body);return ()=>{closed=true;preview?.dispose();};
}
export function garageThumbnails(grid,profile){
 let closed=false;
 (async()=>{for(const card of grid.children){if(closed)return;const spec=CARS.find(c=>c.id===card.dataset.item);if(!spec)continue;const old=card.querySelector('.car-art'),look=appearanceFor(profile,spec.id);if(look.paint==='stock'&&look.finish==='gloss'&&look.stripe==='none'&&look.spoiler==='stock'&&look.glow==='none'){const img=node('img','car-art');img.alt='';img.draggable=false;img.src='assets/cars/'+spec.id+'-preview.png?fit=2';old.replaceWith(img);continue;}const canvas=node('canvas','car-art');canvas.setAttribute('aria-hidden','true');old.replaceWith(canvas);let preview;
  try{preview=await createCarPreview(canvas,spec,appearanceFor(profile,spec.id),{zoom:1.7});if(closed)return;const img=node('img','car-art');img.alt='';img.draggable=false;img.src=preview.snapshot();canvas.replaceWith(img);}catch{if(!closed)canvas.replaceWith(old);}finally{preview?.dispose();}
 }})().catch(()=>{});
 return ()=>{closed=true;};
}
export function collectionBadge(card,{selected,owned,index}){card.classList.toggle('is-equipped',selected);card.classList.toggle('is-owned',owned);const top=node('div','collection-card-meta');top.append(node('span','',String(index+1).padStart(2,'0')),node('span',selected?'equipped-badge':'',selected?'EQUIPPED':owned?'OWNED':'LOCKED'));card.prepend(top);}
const weather={coast:'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',rain:'M6 15a4 4 0 0 1-1-8 6 6 0 0 1 11-1 4.5 4.5 0 1 1 2 9M7 18l-1 3m6-3-1 3m6-3-1 3',snow:'M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M8 4l4 4 4-4M8 20l4-4 4 4M3 11l5 1-1-5m10 10-1-5 5 1M3 13l5-1-1 5m10-10-1 5 5-1',night:'M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12M17 3v4m-2-2h4'};
export function worldArt(id){const art=node('div','world-scene world-scene-'+id);art.setAttribute('aria-hidden','true');art.innerHTML='<div class="weather-overlay"></div><svg viewBox="0 0 24 24"><path d="'+weather[id]+'"/></svg><span class="world-scene-tag">'+({coast:'GOLDEN HOUR',rain:'WET STREETS',snow:'WINTER RUN',night:'AFTER DARK'}[id])+'</span>';return art;}
export function historyEmpty(body){const wrap=node('div','history-empty');wrap.innerHTML='<svg viewBox="0 0 160 90" aria-hidden="true"><path d="M15 78C145 78 10 48 105 42S60 12 145 12"/><path d="M134 5v15m0-13h14l-4 5h-10"/></svg>';wrap.append(node('span','card-kicker','A CLEAN SLATE'),node('h3','','YOUR STORY STARTS ON THE GRID'),node('p','','Finish a race or take an endless drive. Your runs will appear here.'));const b=node('button','primary-action','BACK TO THE GRID ↗');b.onclick=()=>{document.getElementById('collection-close').click();document.getElementById('start').focus();};wrap.append(b);body.append(wrap);}
export function historySummary(body,profile){const summary=node('div','history-summary');for(const [value,label] of [[profile.history.length,'RECENT RUNS'],['◉ '+profile.totalEarned.toLocaleString(),'TOTAL EARNED'],[(profile.best/1000).toFixed(2)+' km','CAREER PB']]){const item=node('div');item.append(node('strong','',String(value)),node('small','',label));summary.append(item);}body.append(summary);}
