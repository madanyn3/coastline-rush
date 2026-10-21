// One mode profile drives both the road mesh and vehicle handling.
import {validRoute,cityElevation} from './routes.js';
export const TRACKS={race:{a:34,p:120,b:14,q:280,h:.9,hp:215,h2:.35,hp2:97},career:{a:28,p:200,b:12,q:430,h:.6,hp:280,h2:.22,hp2:130}};
TRACKS['race-easy']={...TRACKS.race,a:30,p:155,b:12,q:340};
TRACKS['race-hard']={...TRACKS.race,a:38,p:103,b:15,q:230};
export const RACE_DIFFICULTIES=['easy','medium','hard'];
for(const [route,base] of Object.entries({city:{a:27,p:140,b:13,q:290,h:0,hp:215,h2:0,hp2:97},mountain:{a:40,p:99,b:17,q:205,h:7,hp:190,h2:1.8,hp2:68}})){
 TRACKS[route+'-race']={...base};TRACKS[route+'-race-easy']={...base,a:base.a*.91,p:base.p*1.2,q:base.q*1.16};TRACKS[route+'-race-hard']={...base,a:base.a*1.04,p:base.p*.88,q:base.q*.89};TRACKS[route+'-career']={...base,a:base.a*.84,p:base.p*1.4,b:base.b*.9,q:base.q*1.35};
}
export const trackFor=(mode,difficulty='medium',route='coast')=>{const base=mode==='career'?'career':difficulty==='easy'?'race-easy':difficulty==='hard'?'race-hard':'race';return validRoute(route)==='coast'?base:validRoute(route)+'-'+base;};
const profile=mode=>TRACKS[mode]||TRACKS.race;
export function center(s,mode='race'){const t=profile(mode);return t.a*Math.sin(s/t.p+.45)+t.b*Math.sin(s/t.q-.3);}
export function slope(s,mode='race'){const t=profile(mode);return t.a/t.p*Math.cos(s/t.p+.45)+t.b/t.q*Math.cos(s/t.q-.3);}
export function curvature(s,mode='race'){const t=profile(mode);return (-t.a/t.p**2*Math.sin(s/t.p+.45)-t.b/t.q**2*Math.sin(s/t.q-.3))/(1+slope(s,mode)**2)**1.5;}
export function height(s,mode='race'){const t=profile(mode);return t.h*Math.sin(s/t.hp)+t.h2*Math.sin(s/t.hp2)+(mode.startsWith('city-')?cityElevation(s):0);}
export const grade=(s,mode='race')=>(height(s+.1,mode)-height(s-.1,mode))/.2;
export const bend=(forward,distance,mode='race')=>center(distance+forward,mode)-center(distance,mode)-slope(distance,mode)*forward;
export const rise=(forward,distance,mode='race')=>height(distance+forward,mode)-height(distance,mode);
export const heading=(forward,distance,mode='race')=>Math.atan(slope(distance+forward,mode)-slope(distance,mode));
