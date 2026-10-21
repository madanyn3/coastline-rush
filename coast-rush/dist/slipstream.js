export const DRAFT_BONUS=22,DRAFT_MIN_GAP=7,DRAFT_MAX_GAP=28,DRAFT_BUILD_SECONDS=2,DRAFT_FADE_SECONDS=2.5;
export function clearSlipstream(car){car.slipstream=0;car.drafting=false;car.draftTarget=null;}
export function updateSlipstream(car,racers,dt,{enabled=true,brake=false}={}){
 if(brake||car.rail||car.impact>0||car.impactTime>0||car.finishTime!=null){clearSlipstream(car);return;}
 const grounded=c=>(c.jumpY||0)+(c.rampLift||0)<.35;
 const ahead=racers.filter(t=>t!==car&&t.finishTime==null&&t.distance>car.distance&&Math.abs(t.x-car.x)<1.25).sort((a,b)=>a.distance-b.distance)[0];
 const gap=ahead?ahead.distance-car.distance:Infinity;
 const active=enabled&&car.speed>=80&&grounded(car)&&!!ahead&&ahead.speed>=80&&grounded(ahead)&&gap>=DRAFT_MIN_GAP&&gap<=DRAFT_MAX_GAP;
 car.drafting=active;car.draftTarget=active?(ahead.id??'player'):null;
 car.slipstream=Math.max(0,Math.min(1,(car.slipstream||0)+(active?dt/DRAFT_BUILD_SECONDS:-dt/DRAFT_FADE_SECONDS)));
 if(active)car.draftSeconds=(car.draftSeconds||0)+dt;
}
