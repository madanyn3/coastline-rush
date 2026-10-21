import {shortcutOffset} from './shortcuts.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=n=>{n=clamp(n,0,1);return n*n*(3-2*n);};
const cache=new WeakMap();
// The same surface samples drive the road mesh, car suspension and obstacle bases.
export function shortcutChallenges(path){
 if(!path)return {ramps:[],obstacles:[]};if(cache.has(path))return cache.get(path);
 const span=path.exit-path.entry,city=path.profile.startsWith('city-');
 const ramps=[{id:path.id+'-crest-0',distance:path.entry+span*.32,width:18,height:.58},
  {id:path.id+'-crest-1',distance:path.entry+span*.69,width:22,height:.78}];
 const obstacles=[{id:path.id+'-prop-0',distance:path.entry+span*.17,x:1.45,radius:1,loss:.035,kind:'cone'},
  {id:path.id+'-prop-1',distance:path.entry+span*.53,x:-1.45,radius:1.2,loss:.055,kind:city?'barrier':'rock'}];
 const value={ramps,obstacles};cache.set(path,value);return value;
}
export function shortcutSurface(path,d,lateral=0){
 if(!path||d<=path.entry||d>=path.exit)return 0;
 const u=d-path.entry,envelope=smooth(u/15)*smooth((path.exit-d)/15);
 let height=.15+.09*Math.sin(u*.34)+.045*Math.sin(u*.81+.6);
 for(const r of shortcutChallenges(path).ramps){const phase=(d-r.distance)/r.width;if(Math.abs(phase)<.5)height+=r.height*Math.cos(phase*Math.PI)**2;}
 return envelope*(height+clamp(lateral,-2.2,2.2)*.024*Math.sin(u*.19));
}
export const shortcutGrade=(path,d,lateral=0)=>(shortcutSurface(path,d+.15,lateral)-shortcutSurface(path,d-.15,lateral))/.3;
export function updateShortcutTerrain(s,previous){
 const path=s.gameMode==='race'?s.shortcutActive:null;
 s.shortcutLift=0;s.shortcutPitch=0;s.shortcutRoll=0;
 if(!path)return;
 const lateral=s.x-shortcutOffset(path,s.distance),surface=shortcutSurface(path,s.distance,lateral);
 if(s.shortcutAir&&s.jumpVelocity<=0&&s.jumpY<=surface){s.jumpY=0;s.jumpVelocity=0;s.shortcutAir=false;}
 const {ramps,obstacles}=shortcutChallenges(path);s.shortcutRampHits??=[];s.shortcutPropHits??=[];
 for(const r of ramps){if(previous>=r.distance||s.distance<r.distance||s.shortcutRampHits.includes(r.id))continue;s.shortcutRampHits.push(r.id);
  if(s.speed>=70&&!(s.jumpY>0)){s.jumpY=Math.max(surface,shortcutSurface(path,r.distance,lateral));s.jumpVelocity=3+Math.min(s.speed,300)*.006;s.shortcutAir=true;s.rampHits++;}
 }
 if(!(s.jumpY>0)){s.shortcutLift=surface;s.shortcutPitch=Math.atan(shortcutGrade(path,s.distance,lateral));s.shortcutRoll=Math.atan(.024*Math.sin((s.distance-path.entry)*.19))*smooth((s.distance-path.entry)/15)*smooth((path.exit-s.distance)/15);}
 for(const o of obstacles){if(s.shortcutPropHits.includes(o.id)||previous>o.distance+1||s.distance<o.distance-1||Math.abs(lateral-o.x)>o.radius)continue;
  if(s.jumpY-surface>.65)continue;s.shortcutPropHits.push(o.id);s.speed*=1-o.loss;s.obstacleHits++;s.impact=.12;
 }
}
