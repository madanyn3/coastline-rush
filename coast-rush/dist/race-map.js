import {RIVAL_COLORS} from './championship.js';
import {shortcutsFor,shortcutOffset} from './shortcuts.js';
import {center} from './track.js';
import {RACE_LENGTH,raceLength,ROAD_LIMIT} from './physics.js';
const bounded=(n,length)=>Math.max(0,Math.min(length,Number.isFinite(n)?n:0));
const colors=RIVAL_COLORS;
// Keep all six cars in view, with a close view while the pack is together.
// Use the same road profile and lane coordinates as the driving scene.
export function raceMapLayout(s){
 const length=raceLength(s),profile=s.trackProfile||'race',cars=[{id:'player',distance:bounded(s.distance,length),lane:s.x||0,color:'#ffd166'},...(s.traffic||[]).slice(0,5).map((t,i)=>({id:String(t.id??i),distance:bounded(t.distance,length),lane:t.x||0,color:colors[i]}))];
 const first=Math.min(...cars.map(c=>c.distance)),last=Math.max(...cars.map(c=>c.distance));
 let start=Math.max(0,first-50),end=Math.min(length,Math.max(last+80,start+300));start=Math.max(0,Math.min(start,end-300));
 const samples=Array.from({length:73},(_,i)=>{const distance=start+(end-start)*i/72;return {distance,worldX:center(distance,profile)};});
 const cuts=s.gameMode==='race'?shortcutsFor(profile,length).filter(p=>p.end>start&&p.start<end).map(p=>Array.from({length:41},(_,i)=>{const distance=Math.max(start,p.start)+(Math.min(end,p.end)-Math.max(start,p.start))*i/40;return {distance,worldX:center(distance,profile)+shortcutOffset(p,distance)};})):[],all=[...samples,...cuts.flat()];const left=Math.min(...all.map(p=>p.worldX))-ROAD_LIMIT-3,right=Math.max(...all.map(p=>p.worldX))+ROAD_LIMIT+3,span=Math.max(40,right-left),mid=(left+right)/2;
 // Lane offsets stay inside the diagram's road stroke at every zoom level.
 const point=(distance,lane=0)=>({x:80+(center(distance,profile)-mid)/span*140+Math.max(-ROAD_LIMIT,Math.min(ROAD_LIMIT,lane))/ROAD_LIMIT*3.2,y:78-(distance-start)/(end-start)*70});
 return {start,end,range:Math.round(end-start),road:samples.map(p=>point(p.distance)),shortcuts:cuts.map(points=>points.map(p=>({x:80+(p.worldX-mid)/span*140,y:78-(p.distance-start)/(end-start)*70}))),markers:cars.map(c=>({...c,...(c.id==='player'&&s.shortcutActive?{x:80+(center(c.distance,profile)+c.lane-mid)/span*140,y:78-(c.distance-start)/(end-start)*70}:point(c.distance,c.lane))})),finish:end===length?point(length):null,startLine:start===0?point(0):null};
}
const ns='http://www.w3.org/2000/svg';
export function createRaceMap(svg,range){
 const make=(tag,attrs)=>{const e=document.createElementNS(ns,tag);for(const [key,value] of Object.entries(attrs))e.setAttribute(key,value);svg.append(e);return e;};
 const shortcut=make('path',{class:'map-shortcut'});const title=make('title',{});const edge=make('path',{class:'map-road-edge'}),road=make('path',{class:'map-road'}),start=make('path',{class:'map-start-line'}),finish=make('path',{class:'map-finish-line'});
 const bots=Array.from({length:5},(_,i)=>make('circle',{r:2.8,class:'map-rival',fill:colors[i],'data-rival':i}));
 const player=make('path',{d:'M0 -5 4 4 0 2 -4 4Z',class:'map-player'});
 let lastPaint=-Infinity,lastSummary='';
 return {update(s,time=0){if(time-lastPaint<45&&time>=lastPaint)return;lastPaint=time;const map=raceMapLayout(s),path=map.road.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2)).join('');edge.setAttribute('d',path);road.setAttribute('d',path);shortcut.setAttribute('d',map.shortcuts.map(points=>points.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2)).join('')).join(''));range.textContent=map.range+' m';
  for(const [node,point] of [[start,map.startLine],[finish,map.finish]]){node.style.display=point?'':'none';if(point)node.setAttribute('d',`M${point.x-6} ${point.y}h12`);}
  bots.forEach((dot,i)=>{const p=map.markers[i+1];dot.style.display=p?'':'none';dot.classList.toggle('cup-rival',!!p&&p.id===s.cupRivalId);dot.setAttribute('r',p?.id===s.cupRivalId?'3.8':'2.8');if(p){dot.setAttribute('cx',p.x.toFixed(2));dot.setAttribute('cy',p.y.toFixed(2));}});
  const you=map.markers[0];player.setAttribute('transform',`translate(${you.x.toFixed(2)} ${you.y.toFixed(2)})`);
  const ahead=map.markers.slice(1).filter(c=>c.distance>you.distance).length,summary=`Race map. You: ${(you.distance/1000).toFixed(2)} km. ${ahead} rivals ahead, ${map.markers.length-1-ahead} behind.`;if(summary!==lastSummary){title.textContent=summary;svg.setAttribute('aria-label',summary);lastSummary=summary;}
 }};
}
