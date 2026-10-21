import {center,slope} from './track.js';
const cache=new Map();
export function shortcutOffset(path,d){if(!path||d<path.start||d>path.end)return 0;return path.first+(d-path.start)*path.chordSlope-center(d,path.profile);}
export function shortcutsFor(profile,length=3000){if(!profile||profile.includes('career'))return [];const key=profile+'|'+length;if(cache.has(key))return cache.get(key);
 const city=profile.startsWith('city-'),coast=!city&&!profile.startsWith('mountain-');const paths=[];for(let sector=0;sector<length-600;sector+=3000){let best=null;
 for(const span of [200,240,280,320,360])for(let start=sector+300;start+span<Math.min(sector+2700,length-200);start+=25){if(city&&(start-sector<1550||start+span-sector>2000))continue;const end=start+span,first=center(start,profile),chordSlope=(center(end,profile)-first)/span,path={start,end,first,chordSlope,profile},offsets=Array.from({length:41},(_,i)=>shortcutOffset(path,start+span*i/40)),peak=Math.max(...offsets.map(Math.abs)),side=Math.sign(offsets[20]);if(peak<10||peak>23||!side||coast&&side<0||offsets.slice(1,-1).some(x=>x*side<-.1))continue;
  let mainLength=0;for(let i=0;i<80;i++)mainLength+=span/80*Math.hypot(1,slope(start+(i+.5)*span/80,profile));const shortLength=span*Math.hypot(1,chordSlope),score=mainLength-shortLength-Math.abs(peak-18)*.1;
  if(!best||score>best.score){const entry=offsets.findIndex(x=>Math.abs(x)>=4.8),exit=offsets.findLastIndex(x=>Math.abs(x)>=4.8);best={...path,id:profile+'-cut-'+sector,side,peak,score,entry:start+span*entry/40,exit:start+span*exit/40,factor:mainLength/shortLength,name:city?'Service alley':coast?'Harbour cut':'Ridge cut'};}
 }
 if(best)paths.push(best);}cache.set(key,paths);return paths;
}
export function shortcutGate(profile,d,side,length=3000){return shortcutsFor(profile,length).some(p=>p.side===side&&d>p.start&&d<p.end&&Math.abs(shortcutOffset(p,d))>2.8&&Math.abs(shortcutOffset(p,d))<8.8);}
export function shortcutClearance(profile,x,d,padding=3.6,length=3000){return shortcutsFor(profile,length).some(p=>d>p.start&&d<p.end&&Math.abs(shortcutOffset(p,d))>3&&Math.abs(x-shortcutOffset(p,d))<padding);}
export function shortcutBounds(s){if(s.gameMode!=='race')return null;let path=s.shortcutActive;
 if(path&&(s.distance>=path.exit+16||s.distance>path.entry+30&&Math.abs(shortcutOffset(path,s.distance))<3.4)){s.shortcutActive=null;s.shortcutsCompleted=(s.shortcutsCompleted||0)+1;path=null;}
 if(!path){path=shortcutsFor(s.trackProfile,s.raceLength||3000).find(p=>s.distance>=p.entry-12&&s.distance<p.entry+18&&s.x*p.side>3.8&&Math.abs(s.x-shortcutOffset(p,s.distance))<1.5);if(path){s.shortcutActive=path;s.shortcutUses=(s.shortcutUses||0)+1;}}
 if(!path)return null;const x=shortcutOffset(path,s.distance);return {min:x-1.35,max:x+1.35,factor:path.factor};
}
