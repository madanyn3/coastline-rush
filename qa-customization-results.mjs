import fs from 'node:fs';
const dir='coast-rush/dist/';
const file=dir+'scene.js';let scene=fs.readFileSync(file,'utf8');scene=scene.split(/\r?\n/).filter(l=>!l.startsWith(' const cloth=')&&!l.startsWith(' function detailedCar(')&&!l.startsWith(' function legacyGarageCar(')).join('\n');scene=scene.replace("'rail','touringCar',","'rail',").replace('const close=detailedCar([','const close=garageCar(CARS[0],[');fs.writeFileSync(file,scene);
let html=fs.readFileSync(dir+'index.html','utf8');html=html.replace('src="game3d.js"','src="__qa-controller.js"').replace('</body>','<button id="qa-finish" style="position:fixed;z-index:100;bottom:4px;left:4px;padding:8px;background:#dfedff;color:#102532">Finish test race</button></body>');fs.writeFileSync(dir+'__qa-results.html',html);
fs.writeFileSync(dir+'__qa-controller.js',fs.readFileSync(dir+'game3d.js','utf8').replace("from './physics.js'","from './__qa-physics.js'"));
fs.writeFileSync(dir+'__qa-physics.js',`export * from './physics.js';
import {step as actualStep} from './physics.js';let finish=false;
document.getElementById('qa-finish').onclick=()=>{finish=true;};
export function step(s,input,dt){if(finish&&s.mode==='playing'&&s.gameMode==='race'){finish=false;s.distance=2999;s.speed=200;s.time=75.42;s.x=0;s.steering=0;s.draftSeconds=9;s.stripHits=3;s.rampHits=2;s.nitroUses=1;s.nitroBubbleHits=1;s.boostStrips=[];s.ramps=[];s.obstacles=[];s.nitroBubbles=[];s.traffic.forEach((t,i)=>{t.distance=[3000,3000,2960,2890,2750][i];t.finishTime=i<2?74+i*.5:null;t.z=t.distance-s.distance;});}actualStep(s,input,dt);}
`);
console.log('QA fixture ready; remove the three __qa files before packaging.');
