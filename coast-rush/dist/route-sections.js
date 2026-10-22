const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function sectionEnvelope(d,start,end){return smooth((d-start)/80)*smooth((end-d)/80);}
export function laneLimit(route,d){const at=((d%3000)+3000)%3000;return 4.9-(route==='mountain'?.75*sectionEnvelope(at,700,2200):route==='coast'?.45*sectionEnvelope(at,1000,1750):.3*sectionEnvelope(at,1120,1470));}
export function roadWidthScale(route,d){return (laneLimit(route,d)+1.25)/6.15;}
export function landmarkSection(route,d){const at=((d%3000)+3000)%3000;if(route==='mountain'&&at>=1500&&at<=1720)return 'Summit tunnel';if(route==='coast'&&at>=1100&&at<=1650)return 'Harbour narrows';return null;}
