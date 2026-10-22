import {curvature} from './track.js';
export function updateDrift(s,input,dt){
 const curve=curvature(s.distance+8,s.trackProfile),turn=Math.sign(input.steer||0),into=turn!==0&&turn===-Math.sign(curve);
 const allowed=s.gameMode!=='career'&&s.speed>85&&s.speed<245&&Math.abs(curve)>.00045&&into&&!s.rail&&!s.jumpY&&!s.shortcutActive;
 if(allowed&&input.brake&&Math.abs(input.steer)>.25){s.driftTime=Math.min(5,(s.driftTime||0)+dt);s.drifting=true;s.driftAngle=turn*Math.min(.28,.1+s.driftTime*.06);}
 else if(s.drifting){if(!s.rail&&!s.impact&&s.driftTime>.35){const earned=Math.min(20,s.driftTime*7);s.nitro=Math.min(100,s.nitro+earned);s.driftBank=(s.driftBank||0)+earned;s.driftCount=(s.driftCount||0)+1;s.driftBest=Math.max(s.driftBest||0,s.driftTime);}s.drifting=false;s.driftTime=0;}
 if(!s.drifting)s.driftAngle=(s.driftAngle||0)*Math.exp(-dt*8);
}
