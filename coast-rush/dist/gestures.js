// A pair of distinct, short presses. Holds, key repeats and pointer-cancel
// events must never count as a double tap.
export class GasDoubleTap {
 constructor(){this.reset();}
 reset(){this.lastTap=-Infinity;this.presses=new Map();}
 down(time,id){if(this.presses.has(id))return false;const paired=time>=this.lastTap&&time-this.lastTap<=320;this.lastTap=-Infinity;this.presses.set(id,{time,paired});return paired;}
 up(time,id,cancel=false){const press=this.presses.get(id);if(!press)return;this.presses.delete(id);if(!cancel&&!press.paired&&time>=press.time&&time-press.time<=230)this.lastTap=time;else if(!press.paired)this.lastTap=-Infinity;}
}
