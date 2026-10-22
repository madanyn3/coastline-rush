import {normalizeSettings,qualityFor,SETTINGS_KEY} from './driver-settings.js';
import {exportSave,parseSave} from './save-backup.js';
import {ACHIEVEMENTS} from './achievements.js';
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
export function createDriverHub({profile,settings,onSettings,onPause,onPractice,notify,commit}){
 const modal=node('section');modal.id='driver-hub';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Driver settings');
 const top=node('div'),title=node('h2','Driver hub'),close=node('button','← THE GRID');top.className='driver-top';top.append(title,close);const nav=node('nav'),body=node('div');nav.setAttribute('aria-label','Driver hub sections');body.className='driver-body';modal.append(top,nav,body);document.querySelector('.game').append(modal);let tab='setup',pending=null;
 const button=(text,action)=>{const b=node('button',text);b.onclick=action;return b;};
 function save(){onSettings(normalizeSettings(settings));try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));}catch{notify('Settings could not save');}}
 function row(label,control,detail){const l=node('label');l.append(node('b',label),control);if(detail)l.append(node('small',detail));body.append(l);return l;}
 function render(){body.replaceChildren();nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));
  if(tab==='setup'){
   body.append(node('p','Tune the game for your phone. Changes apply immediately.'));
   const quality=node('select');quality.setAttribute('aria-label','Graphics quality');for(const [v,t] of [['auto','Auto'],['low','Low · lighter models · 30 fps'],['balanced','Balanced · 60 fps target'],['high','High · full detail + shadows']]){const o=node('option',t);o.value=v;quality.append(o);}quality.value=settings.quality;quality.onchange=()=>{settings.quality=quality.value;save();};row('Graphics',quality,'Auto starts lighter on phones with fewer CPU cores or less memory, and can lower detail if frames are slow.');
   const sensitivity=node('input');sensitivity.type='range';sensitivity.min='.65';sensitivity.max='1.5';sensitivity.step='.05';sensitivity.value=settings.sensitivity;sensitivity.setAttribute('aria-label','Tilt sensitivity');const value=node('output',settings.sensitivity.toFixed(2)+'×');sensitivity.oninput=()=>{settings.sensitivity=Number(sensitivity.value);value.textContent=settings.sensitivity.toFixed(2)+'×';save();};row('Tilt sensitivity',sensitivity,'Hold steady when enabling tilt; use ⊙ to recenter.').append(value);
   for(const [key,label,detail] of [['assist','Corner assist','Softens outward road pull. Turns still need steering.'],['reducedMotion','Reduced motion','Disable speed FOV and celebration movement.']]){const input=node('input');input.type='checkbox';input.checked=settings[key];input.onchange=()=>{settings[key]=input.checked;save();};row(label,input,detail);}
   body.append(button('Practice the controls ↗',()=>{modal.hidden=true;onPractice();}),node('p','Drift: steer into a bend while lightly braking above 85 km/h, then release the brake cleanly to bank nitro. Career has no drift rewards.'));
  }else if(tab==='medals'){
   body.append(node('p','Milestones pay once. Earned rewards and medals are included in save backups.'));
   for(const a of ACHIEVEMENTS){const card=node('article');card.append(node('h3',(profile.achievements?.includes(a.id)?'✓ ':'◇ ')+a.name),node('p',a.detail),node('small','+'+a.reward+' ◉'+(a.cosmetic?' · Ember paint unlock':'')));body.append(card);}
   const medals=profile.medals||{};body.append(node('p',`Race medals · 🥇 ${medals.gold||0} · 🥈 ${medals.silver||0} · 🥉 ${medals.bronze||0}`));
  }else{
   body.append(node('p','Back up coins, cars, upgrades, paint, cups and trial ghosts. Import replaces this device’s save after a preview. Backups are not cloud sync.'));
   body.append(button('Export backup ↓',()=>{const text=exportSave(profile,settings);if(window.AndroidMotion?.exportSave){AndroidMotion.exportSave(text);return;}const a=node('a');const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.href=url;a.download='CoastlineRush-save-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}));
   const file=node('input');file.type='file';file.accept='.json,application/json';file.hidden=true;file.onchange=async()=>{const f=file.files[0];if(!f)return;if(f.size>8*1024*1024){notify('Backup is too large');return;}try{preview(await f.text());}catch{notify('Could not read backup');}};body.append(file,button('Import backup ↑',()=>window.AndroidMotion?.importSave?AndroidMotion.importSave():file.click()));
   if(pending){const card=node('article');card.append(node('h3','Replace current save?'),node('p',`Backup: ${pending.profile.wallet} ◉ · ${pending.profile.ownedCars.length} cars · ${pending.profile.history.length} runs`),node('p','Your current save will be kept locally as a recovery copy.'));card.append(button('Replace my save',()=>{try{localStorage.setItem('coast-save-before-import',exportSave(profile,settings));localStorage.setItem(SETTINGS_KEY,JSON.stringify(normalizeSettings(pending.settings)));localStorage.setItem('coast-profile-v1',JSON.stringify(pending.profile));location.reload();}catch{notify('Import failed. Current save is unchanged unless replacement was already written.');}}),button('Cancel import',()=>{pending=null;render();}));body.append(card);}
   if(localStorage.getItem('coast-save-before-import'))body.append(button('Preview recovery copy',()=>preview(localStorage.getItem('coast-save-before-import'))));
  }
 }
 function preview(text){try{pending=parseSave(text);tab='backup';modal.hidden=false;render();}catch(e){notify(e.message);}}
 window.nativeImportSave=preview;window.nativeSaveResult=ok=>notify(ok?'Backup saved':'Backup cancelled or unavailable');
 for(const [id,label] of [['setup','Drive'],['medals','Medals'],['backup','Backups']]){const b=button(label,()=>{tab=id;render();});b.dataset.tab=id;nav.append(b);}
 close.onclick=()=>{modal.hidden=true;document.querySelector('#driver-settings')?.focus();};modal.addEventListener('keydown',e=>{if(e.key==='Escape')close.click();if(e.key==='Tab'){const controls=[...modal.querySelectorAll('button,input:not([hidden]),select')].filter(e=>e.getClientRects().length),i=controls.indexOf(document.activeElement);e.preventDefault();controls[(i+(e.shiftKey?-1:1)+controls.length)%controls.length]?.focus();}});
 const entry=button('⚙ Driver hub',()=>{onPause();modal.hidden=false;render();close.focus();});entry.id='driver-settings';entry.setAttribute('aria-label','Open driver settings');document.querySelector('.launch-bottom').append(entry);
 return {get open(){return !modal.hidden;},close(){modal.hidden=true;},show:()=>entry.click()};
}
