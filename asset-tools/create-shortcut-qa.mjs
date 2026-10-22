import fs from 'node:fs';
const dist=new URL('../coast-rush/dist/',import.meta.url);
fs.writeFileSync(new URL('__qa-shortcut.html',dist),fs.readFileSync(new URL('index.html',dist),'utf8').replace('src="game3d.js"','src="__qa-shortcut.js"'));
fs.writeFileSync(new URL('__qa-shortcut.js',dist),"import {shortcutOffset} from './shortcuts.js';\n"+fs.readFileSync(new URL('game3d.js',dist),'utf8')+`
const qa=document.createElement('button');qa.textContent='QA shortcut';qa.style.cssText='position:fixed;z-index:999;right:12px;bottom:100px';document.body.append(qa);
qa.onclick=async()=>{await start({setup:{...captureRunSetup(profile,'race','normal',carStats(profile),'medium',appearanceFor(profile)),route:'coast',world:'coast'}});const path=shortcutsFor(race.trackProfile,race.raceLength)[0];race.distance=path.entry+85;race.speed=180;race.x=shortcutOffset(path,race.distance);race.shortcutActive=path;race.traffic=[];race.mode='paused';qa.hidden=true;};
`);
console.log('Temporary shortcut preview ready. Remove __qa-shortcut files before release.');
