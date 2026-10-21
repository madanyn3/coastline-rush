import fs from 'node:fs';const base='coast-rush/dist/';let js=fs.readFileSync(base+'game3d.js','utf8');js="import {curveDrift as qaDrift,steeringRate as qaRate} from './physics.js';\nimport {normalizeChampionship as qaNormalize} from './championship.js';\n"+js;
js+=`
const qaPanel=document.createElement('div');qaPanel.style='position:fixed;right:10px;top:76px;z-index:1000;display:flex;gap:4px;flex-wrap:wrap;max-width:400px';
function qaButton(label,action){const b=document.createElement('button');b.textContent=label;b.onclick=action;qaPanel.append(b);}
function qaDrive(target=Infinity){race.mode='playing';for(let i=0;i<40000&&race.mode==='playing'&&race.distance<target;i++){if(race.nitro>=100)activateNitro(race);const speed=Math.max(1,race.speed),steer=-qaDrift(race.distance,speed,race.trackProfile)/qaRate(speed)-race.x*.8;step(race,{gas:true,steer},1/60);}if(race.mode==='over')finish();else{race.resumeMode='playing';race.mode='paused';updateStatus();}}
qaButton('QA finish round',()=>{if(runSetup)qaDrive();});
qaButton('QA fresh cup profile',()=>{if(profile.active)recordRun(profile,race,'retired');profile.championship=qaNormalize(null);runSetup=null;race.mode='ready';cupChoice='coastline';commit();openChampionship();});
qaButton('QA Masters qualification',()=>{if(profile.active)recordRun(profile,race,'retired');profile.championship.active=null;profile.championship.records.push({id:'qa-neon-podium',cupKey:'neon',level:'medium',place:3,date:new Date().toISOString(),bonus:0});runSetup=null;race.mode='ready';cupChoice='masters';commit();openChampionship();});
qaButton('QA drive Masters to final',async()=>{let cup=profile.championship.active;if(!cup||cup.cupKey!=='masters')return;while(cup.results.length<9){await start({setup:championshipSetup(cup)});qaDrive();}await start({setup:championshipSetup(cup)});qaDrive(9400);});
qaButton('QA finish approach',()=>qaDrive(raceLength(race)-120));qaButton('Hide checks',()=>qaPanel.hidden=true);document.body.append(qaPanel);
`;fs.writeFileSync(base+'__qa-ladder.js',js);fs.writeFileSync(base+'__qa-ladder.html',fs.readFileSync(base+'index.html','utf8').replace('src="game3d.js"','src="__qa-ladder.js"'));
