// Recycle a specific object only after it is behind the camera. Its visible
// position stays continuous across every road-tile boundary.
export function sceneryForward(anchor,distance,span=312,behind=32){
 const forward=anchor-distance;
 return forward< -behind?forward+Math.ceil((-behind-forward)/span)*span:forward;
}
