export function resetCombo(s){s.nearCombo=0;s.comboTime=0;}
export function updateNearMisses(s,dt,previousDistance,previousX){
 if(s.gameMode!=='career')return;
 s.comboTime=Math.max(0,(s.comboTime||0)-dt);if(!s.comboTime)s.nearCombo=0;
 if(s.mode!=='playing'||s.rail){resetCombo(s);for(const t of s.traffic)t.nearPass=null;return;}
 for(const t of s.traffic){
  if(t.nearAwarded)continue;
  const oldZ=(t.previousDistance??t.distance)-previousDistance,z=t.distance-s.distance;
  if(oldZ>=6&&z<6)t.nearPass={clearance:Infinity,valid:true};
  const pass=t.nearPass;if(!pass)continue;
  if(s.speed<90||s.speed-t.speed<15)pass.valid=false;
  if(Math.abs(z)<4.5||oldZ>=0&&z<0){const gap=Math.min(Math.abs(s.x-t.x),Math.abs(previousX-t.x));pass.clearance=Math.min(pass.clearance,gap);if(gap<=1.3)pass.valid=false;}
  if(z<-3.5){t.nearAwarded=true;t.nearPass=null;if(!pass.valid||pass.clearance>2.25||pass.clearance<1.35)continue;
   s.nearCombo=(s.nearCombo||0)+1;s.comboTime=6;s.bestCombo=Math.max(s.bestCombo||0,s.nearCombo);s.nearMisses=(s.nearMisses||0)+1;
   const multiplier=Math.min(5,1+Math.floor((s.nearCombo-1)/2)),reward=3*multiplier;s.nearReward=(s.nearReward||0)+reward;s.collected+=reward;s.lastNearReward=reward;s.nearFlash=1.8;
  }
 }
 s.nearFlash=Math.max(0,(s.nearFlash||0)-dt);
}
