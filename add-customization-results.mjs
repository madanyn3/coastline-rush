import fs from 'node:fs';
const dir='coast-rush/dist/';
function edit(file,fn){fs.writeFileSync(dir+file,fn(fs.readFileSync(dir+file,'utf8')));}
function replace(s,a,b){if(!s.includes(a))throw Error('Missing anchor: '+a.slice(0,100));return s.replace(a,b);}
edit('progression.js',s=>{s="import {appearanceFor,normalizeAppearance} from './customization.js';\n"+s;s=replace(s,'missions:normalizeMissions(p?.missions)','missions:normalizeMissions(p?.missions),customization:Object.fromEntries(ownedCars.map(car=>[car,normalizeAppearance(p?.customization?.[car])]))');return replace(s,'upgrades:upgradeLevels(p),distance:0','upgrades:upgradeLevels(p),appearance:appearanceFor(p),distance:0');});
edit('index.html',s=>{s=replace(s,'href="missions.css">','href="missions.css"><link rel="stylesheet" href="customization-results.css">');return replace(s,'<div id="notice" role="status">','<section id="race-results" hidden role="dialog" aria-modal="true" aria-label="Race results"><div id="race-results-body"></div><div class="results-actions"><button id="results-menu">Modes</button><button id="results-again">Race again ↗</button></div></section><div id="notice" role="status">');});
edit('game3d.js',s=>{
 s="import {appearanceFor,paintColor} from './customization.js';\nimport {renderCustomization} from './customization-ui.js';\nimport {raceResults,renderRaceResults} from './race-results.js';\n"+s;
 s=replace(s,"tuningCar=profile.car;","tuningCar=profile.car,closeCustomizer=()=>{};");
 s=replace(s,"function collection(tab=collectionTab){collectionTab=tab;","function collection(tab=collectionTab){closeCustomizer();closeCustomizer=()=>{};collectionTab=tab;");
 s=replace(s," if(tab==='missions')", " if(tab==='customize'){$('collection-title').textContent='Style · '+carName(tuningCar);closeCustomizer=renderCustomization(body,profile,tuningCar,{commit,back:()=>collection('garage'),notify:notice});return;}\n if(tab==='missions')");
 s=replace(s,"'+item.color+'", "'+paintColor(item,appearanceFor(profile,item.id))+'");
 s=replace(s,"actions.append(tune);}","actions.append(tune);const customize=document.createElement('button');customize.className='customize-car';customize.textContent='Style';customize.setAttribute('aria-label','Customize '+item.name);customize.onclick=()=>{tuningCar=item.id;collection('customize');};actions.append(customize);}");
 s=replace(s,"$('collection-close').onclick=()=>{$('collection').hidden=true;", "$('collection-close').onclick=()=>{closeCustomizer();closeCustomizer=()=>{};$('collection').hidden=true;");
 s=replace(s,"collectionTab==='upgrades')", "collectionTab==='upgrades'||collectionTab==='customize')");
 s=replace(s,"const title=document.createElement('h3');title.textContent=item.name;", "const title=document.createElement('h3');title.textContent=item.name;");
 s=replace(s,"'Result','◉']", "'Result','◉','']");
 s=replace(s,"h.coins])r.insertCell().textContent=value;}","h.coins])r.insertCell().textContent=value;const cell=r.insertCell();if(h.result?.version===1){const button=document.createElement('button');button.className='history-result';button.textContent='Results';button.setAttribute('aria-label','View race results from '+new Date(h.date).toLocaleDateString());button.onclick=()=>{showResults(h.result);};cell.append(button);}}");
 s=replace(s,"if(race.mode==='ready'){race.carId=profile.car;", "if(race.mode==='ready'){race.appearance=appearanceFor(profile);race.carId=profile.car;");
 s=replace(s,"async function start(){if(!view||starting)return;starting=true;try{", "async function start(){if(!view||starting)return;starting=true;try{closeCustomizer();closeCustomizer=()=>{};hideResults();");
 s=replace(s,"race.carId=spec.id;race.worldId=profile.world;", "race.carId=spec.id;race.appearance=appearanceFor(profile);race.worldId=profile.world;");
 const finishStart="function finish(){clearInput();const reward=settleReward(race),missionResult=settleMissions(profile,race),totalReward=reward+missionResult.reward;recordRun";
 s=replace(s,finishStart,"function finish(){clearInput();const reward=settleReward(race),missionResult=settleMissions(profile,race),totalReward=reward+missionResult.reward;const summary=race.gameMode==='race'?raceResults(race,{car:profile.active?.car||profile.car,world:profile.active?.world||profile.world,raceReward:reward,missionReward:missionResult.reward,profile}):null;if(summary&&profile.active)profile.active.result=summary;recordRun");
 s=replace(s,"$('state').textContent=race.gameMode==='race'?'FINISH':'CRASH';}","$('state').textContent=race.gameMode==='race'?'FINISH':'CRASH';if(summary)showResults(summary);}");
 const insert=`function hideResults(){$('race-results').hidden=true;document.body.classList.remove('results-open');}
function showResults(summary){closeCustomizer();closeCustomizer=()=>{};$('collection').hidden=true;renderRaceResults($('race-results-body'),summary,{carName,worldName});$('race-results').hidden=false;$('race-results').scrollTop=0;document.body.classList.add('results-open');$('results-again').focus();}
$('results-menu').onclick=()=>{hideResults();openMenu();$('start').focus();};
$('results-again').onclick=()=>{selectedMode='race';save('coast-mode','race');start();};
document.addEventListener('keydown',e=>{if($('race-results').hidden)return;if(e.key==='Escape'){$('results-menu').click();e.stopImmediatePropagation();}if(e.key==='Tab'){const buttons=[...$('race-results').querySelectorAll('button:not(:disabled)')],i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();}},true);
`;
 return replace(s,'function display(){',insert+'function display(){');
});
edit('scene.js',s=>{
 s="import {loadCarModel,buildCar,disposeCar} from './car-visuals.js';\nimport {normalizeAppearance} from './customization.js';\n"+s;
 s=replace(s," function garageCar(spec,color=spec.color)"," function legacyGarageCar(spec,color=spec.color)");
 s=replace(s," const player=new THREE.Group();player.add(garageCar(CARS[0]));let currentCar='classic';", " await loadCarModel();const garageCar=(spec,color)=>buildCar(spec,undefined,color);\n const player=new THREE.Group();player.add(buildCar(CARS[0]));let currentCar='classic',currentLook=JSON.stringify(normalizeAppearance());");
 const a="  if(s.carId&&s.carId!==currentCar){",b="  const lookKey=JSON.stringify(normalizeAppearance(s.appearance));if((s.carId||'classic')!==currentCar||lookKey!==currentLook){const carChanged=(s.carId||'classic')!==currentCar;currentLook=lookKey;";
 s=replace(s,a,b);
 s=replace(s,"old.traverse(o=>{if(o.isMesh&&o.material.name==='ToyCar')o.material.dispose();});player.remove(old);player.add(garageCar(spec));traffic.forEach((g,i)=>{g.remove(g.children[3]);g.add(garageCar(spec,['#64cc99','#ed7272','#cedced'][i%3]));});", "disposeCar(old);player.remove(old);player.add(buildCar(spec,s.appearance));if(carChanged)traffic.forEach((g,i)=>{const old=g.children[3];disposeCar(old);g.remove(old);g.add(garageCar(spec,['#64cc99','#ed7272','#cedced'][i%3]));});");
 s=replace(s,"currentCar=s.carId;const spec", "currentCar=s.carId||'classic';const spec");
 return s;
});
const manifest='android/AndroidManifest.xml';fs.writeFileSync(manifest,fs.readFileSync(manifest,'utf8').replace('versionCode="21"','versionCode="22"').replace('versionName="1.20"','versionName="1.21"'));
