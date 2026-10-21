import {UPGRADES,carStats,upgradeLevels,upgradeCost,buyUpgrade,buy} from './progression.js';
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
export function renderUpgrades(body,profile,car,{commit,back,refresh,notify}){
 if(!profile.ownedCars.includes(car)){back();return;}
 const stats=carStats(profile,car),levels=upgradeLevels(profile,car),top=el('div','tune-toolbar'),backButton=el('button','tune-back','← Garage'),summary=el('div','tune-summary');backButton.onclick=back;
 summary.append(el('strong','',stats.max+' km/h · Build '+stats.upgradeCount+'/12'),el('small','','Next run · Rivals match your build'));
 const equip=el('button','',profile.car===car?'Equipped':'Use car');equip.disabled=profile.car===car;equip.onclick=()=>{const previous=profile.car;buy(profile,'car',car);if(!commit()){profile.car=previous;commit();notify('Save unavailable. Selection unchanged.');}refresh();};top.append(backButton,summary,equip);body.append(top);
 const grid=el('div','upgrade-grid');
 for(const item of UPGRADES){const level=levels[item.id],cost=upgradeCost(profile,car,item.id),maxed=cost===null,card=el('article','upgrade-card'),header=el('div','upgrade-card-head'),icon=el('span','upgrade-icon',item.icon),heading=el('h3','',item.name),badge=el('span','upgrade-level',level+'/3');header.append(icon,heading,badge);
 const pips=el('div','upgrade-pips');pips.setAttribute('role','img');pips.setAttribute('aria-label',item.name+' level '+level+' of 3');for(let i=0;i<3;i++)pips.append(el('span',i<level?'filled':''));
 const format=l=>item.id==='nitro'?(3+l*item.step).toFixed(1)+'s':'+'+Math.round(l*item.step*100)+'%',preview=el('div','upgrade-preview');preview.append(el('span','current',format(level)));if(!maxed){preview.append(el('span','upgrade-arrow','→'),el('strong','',format(level+1)));}else preview.append(el('strong','upgrade-max','MAX'));
 const detail=el('p','upgrade-description',item.description),button=el('button','upgrade-buy',maxed?'Maxed':'Upgrade · ◉ '+cost);button.disabled=maxed||profile.wallet<cost;button.setAttribute('aria-label',maxed?item.name+' maxed':'Upgrade '+item.name+' to level '+(level+1)+' for '+cost+' coins');
 button.onclick=()=>{const oldWallet=profile.wallet,oldLevels=upgradeLevels(profile,car);if(!buyUpgrade(profile,car,item.id))return;if(!commit()){profile.wallet=oldWallet;profile.upgrades[car]=oldLevels;commit();notify('Save unavailable. Upgrade not purchased.');}else notify(item.name+' · Level '+(level+1));refresh();};
 const foot=el('div','upgrade-card-foot');foot.append(button);if(!maxed&&profile.wallet<cost)foot.append(el('small','upgrade-shortfall','Need ◉ '+(cost-profile.wallet)+' more'));card.append(header,pips,preview,detail,foot);grid.append(card);
 }body.append(grid);
}
