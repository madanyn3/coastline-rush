import fs from 'node:fs';
const base='coast-rush/dist/';
let s=fs.readFileSync(base+'game3d.js','utf8');
s="import {TrialRecorder,trialKey,trialTime,ghostPose,ghostTimeAt,finishTrial,renderTrialResults} from './time-trials.js';\nimport {shortcutsFor} from './shortcuts.js';\n"+s;
s=s.replace("selectedMode=read('coast-mode','race')==='career'?'career':'race'","selectedMode=['career','trial'].includes(read('coast-mode','race'))?read('coast-mode','race'):'race'");
s=s.replace('closeCustomizer=()=>{},resultsSetup=null;','closeCustomizer=()=>{},resultsSetup=null,trialRecorder=null,trialReference=null,lastNear=0;');
s=s.replace("race.gameMode!=='race'||race.mode!=='playing'","race.gameMode==='career'||race.mode!=='playing'");
s=s.replace("const career=selectedMode==='career';","const trial=selectedMode==='trial',career=selectedMode==='career';$('choose-trial').setAttribute('aria-pressed',String(trial));");
s=s.replace("String(!career));$('choose-career')","String(!career&&!trial));$('choose-career')");
s=s.replace("career?'Career':'Race'","trial?'Time Trial':career?'Career':'Race'");
s=s.replace("career?'Endless road · Traffic · Collect ◉':'3 km · 5 rivals · Ramps + Nitro'","trial?'3 km · Solo · Best-run ghost':career?'Endless road · Traffic · Near-miss combos':'3 km · 5 rivals · Shortcuts + Nitro'");
s=s.replace("$('mode-hint').textContent=career?","const trialBest=profile.timeTrials.find(r=>r.key===trialKey(captureRunSetup(profile,'trial','normal',carStats(profile),raceLevel,appearanceFor(profile)))) ;$('mode-hint').textContent=trial?('PB '+trialTime(trialBest?.time)+' · Same car + build'):career?");
s=s.replace("'Coins save immediately. Barriers only slow you.'","'Close overtakes above 90 km/h earn combo coins. Rails break the combo.'");
s=s.replace("$('start').textContent=career?'DRIVE ↗':'RACE ↗';$('start').setAttribute('aria-label',career?'Start career':'Start race');","$('start').textContent=trial?'TIME TRIAL ↗':career?'DRIVE ↗':'RACE ↗';$('start').setAttribute('aria-label',trial?'Start time trial':career?'Start career':'Start race');");
s=s.replace("for(const mode of ['race','career'])","for(const mode of ['race','career','trial'])");
s=s.replace('runSetup=setup;journalTime=0;','runSetup=setup;trialRecorder=setup.mode===\'trial\'?new TrialRecorder():null;trialReference=setup.mode===\'trial\'?profile.timeTrials.find(r=>r.key===trialKey(setup))||null:null;lastNear=0;journalTime=0;');
const start=s.indexOf('function finish(){'),end=s.indexOf('\nfunction hideResults()',start);
s=s.slice(0,start)+`function finish(){
 clearInput();
 if(race.gameMode==='trial'){
  const summary=finishTrial(profile,race,runSetup,trialRecorder);if(profile.active)profile.active.result=summary;recordRun(profile,race,'finish');commit();modeCopy();$('overlay').hidden=false;$('result').hidden=true;showResults(summary);return;
 }
 const reward=settleReward(race),missionResult=settleMissions(profile,race),totalReward=reward+missionResult.reward;
 const summary=race.gameMode==='race'?raceResults(race,{car:profile.active?.car||profile.car,world:profile.active?.world||profile.world,route:race.routeId,raceReward:reward,missionReward:missionResult.reward,profile}):null;
 if(summary){summary.shortcuts=race.shortcutsCompleted||0;if(profile.active)profile.active.result=summary;}
 recordRun(profile,race,race.gameMode==='race'?'finish':'crash',totalReward);commit();if(race.gameMode==='career'&&race.distance>best){best=race.distance;profile.best=best;commit();save('coast-career-best',best);}
 modeCopy();$('result').hidden=false;$('result-title').textContent=race.gameMode==='race'?race.place+'/6 · +'+totalReward+' ◉':(race.distance/1000).toFixed(2)+' km · +'+race.collected+' ◉';
 $('result-detail').textContent=race.gameMode==='race'?'3 km · '+clock(race.time):'PB '+(best/1000).toFixed(2)+' km · '+race.nearMisses+' near misses · Best combo '+race.bestCombo;$('overlay').hidden=false;$('state').textContent=race.gameMode==='race'?'FINISH':'CRASH';if(summary)showResults(summary);
}`+s.slice(end);
s=s.replace("resultsSetup={route:validRoute(summary.route),difficulty:summary.difficulty};","resultsSetup={route:validRoute(summary.route),difficulty:summary.difficulty,mode:summary.mode||'race'};");
s=s.replace("renderRaceResults($('race-results-body'),summary,{carName,worldName,routeName});","(summary.mode==='trial'?renderTrialResults:renderRaceResults)($('race-results-body'),summary,{carName,worldName,routeName});$('results-again').textContent=summary.mode==='trial'?'Try again ↗':'Race again ↗';");
s=s.replace("selectedMode='race';save('coast-mode','race');start();","selectedMode=resultsSetup?.mode||'race';save('coast-mode',selectedMode);start();");
s=s.replace("if(h.result?.version===1)","if(h.result?.version===1||h.result?.version===2)");
s=s.replace("h.mode==='race'?'Race · '+(h.difficulty||'medium'):'Career'","h.mode==='trial'?'Trial · '+(h.difficulty||'medium'):h.mode==='race'?'Race · '+(h.difficulty||'medium'):'Career'");
s=s.replace("else writeText('stat-label','POS');","else writeText('stat-label',race.gameMode==='trial'?'TIME':'POS');");
s=s.replace("career?String(race.collected):\`\${race.mode==='ready'?6:race.place} <em>/ 6</em>\`","race.gameMode==='trial'?trialTime(race.time):career?String(race.collected):`${race.mode==='ready'?6:race.place} <em>/ 6</em>`");
s=s.replace("document.body.classList.toggle('race-look',race.gameMode==='race');","document.body.classList.toggle('race-look',race.gameMode!=='career');");
s=s.replace("if(old==='playing'&&race.mode==='over')finish();","if(race.gameMode==='trial'&&trialRecorder&&(race.mode==='playing'||race.mode==='countdown'))trialRecorder.add(race);race.ghostPose=race.gameMode==='trial'?ghostPose(trialReference,race.time):null;if(old==='playing'&&race.mode==='over')finish();updateFeatureHud();");
s += `
function updateFeatureHud(){
 const hud=$('run-feature-hud');hud.hidden=race.mode==='ready'||race.mode==='over';if(hud.hidden)return;
 if(race.gameMode==='trial'){const reference=ghostTimeAt(trialReference,race.distance),delta=reference===null?null:race.time-reference;hud.dataset.kind='trial';hud.textContent='⏱ '+trialTime(race.time)+' · '+(delta===null?'FIRST RUN':(delta<=0?'−':'+')+Math.abs(delta).toFixed(2)+' s')+' · PB '+trialTime(trialReference?.time);}
 else if(race.gameMode==='career'){hud.hidden=!race.nearCombo;hud.dataset.kind='combo';hud.textContent='NEAR MISS ×'+Math.min(5,1+Math.floor((race.nearCombo-1)/2))+' · '+race.nearCombo+' streak · '+race.comboTime.toFixed(1)+' s';if(race.nearMisses>lastNear){lastNear=race.nearMisses;notice('NEAR MISS +'+race.lastNearReward+' ◉');}}
 else{const next=race.shortcutActive||shortcutsFor(race.trackProfile).find(p=>p.entry>=race.distance&&p.entry-race.distance<180);hud.hidden=!next;hud.dataset.kind='shortcut';if(next)hud.textContent=(next.side>0?'↗ ':'↖ ')+next.name.toUpperCase()+' · '+(race.shortcutActive?'NARROW':Math.round(next.entry-race.distance)+' m');}
 canvas.dataset.nearMisses=String(race.nearMisses||0);canvas.dataset.nearCombo=String(race.nearCombo||0);canvas.dataset.shortcut=String(!!race.shortcutActive);canvas.dataset.shortcutUses=String(race.shortcutUses||0);
}
`;
fs.writeFileSync(base+'game3d.js',s);
let html=fs.readFileSync(base+'index.html','utf8');html=html.replace('<link rel="stylesheet" href="collection-deck.css">','<link rel="stylesheet" href="collection-deck.css"><link rel="stylesheet" href="game-features.css">');
html=html.replace('<div id="result" hidden', '<div id="result" hidden');
html=html.replace('<span class="mode-index">02</span></button></div>','<span class="mode-index">02</span></button><button id="choose-trial" aria-pressed="false"><span class="mode-icon">⏱</span><span>TIME TRIAL<small>Beat your best</small></span><span class="mode-index">03</span></button></div>');
html=html.replace('<aside id="race-map"','<div id="run-feature-hud" hidden aria-live="polite"></div><aside id="race-map"');
fs.writeFileSync(base+'index.html',html);
for(const file of ['worlds.js','cyber.js']){let source=fs.readFileSync(base+file,'utf8');source=source.replaceAll("s.gameMode==='race'","s.gameMode!=='career'");fs.writeFileSync(base+file,source);}
let audio=fs.readFileSync(base+'audio.js','utf8');audio=audio.replace("s.gameMode==='race'?'finish':'crash'","s.gameMode!=='career'?'finish':'crash'");fs.writeFileSync(base+'audio.js',audio);
