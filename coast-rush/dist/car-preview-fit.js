import * as THREE from './vendor/three.module.js';
// Fit the visible geometry, rather than using one zoom for different body shapes.
export function fitCarPreview(camera,car,aspect,fill=.86){
 car.updateMatrixWorld(true);
 const bounds=new THREE.Box3(),worldPoint=new THREE.Vector3();
 function vertices(visit){car.traverseVisible(mesh=>{if(!mesh.isMesh)return;const positions=mesh.geometry.getAttribute('position'),indices=mesh.geometry.index;for(let i=0;i<(indices?.count||positions.count);i++){worldPoint.fromBufferAttribute(positions,indices?indices.getX(i):i).applyMatrix4(mesh.matrixWorld);visit(worldPoint);}});}
 vertices(p=>bounds.expandByPoint(p));
 const center=bounds.getCenter(new THREE.Vector3()),direction=new THREE.Vector3(3.2,1.5,4.3).normalize();
 camera.position.copy(center).add(direction);camera.lookAt(center);camera.zoom=1;camera.aspect=Math.max(.1,aspect);
 const inverse=camera.quaternion.clone().invert(),point=new THREE.Vector3(),tanY=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),tanX=tanY*camera.aspect;
 let distance=.5;
 vertices(p=>{point.copy(p).sub(center).applyQuaternion(inverse);distance=Math.max(distance,point.z+Math.abs(point.x)/(tanX*fill),point.z+Math.abs(point.y)/(tanY*fill));});
 camera.position.copy(center).addScaledVector(direction,distance);camera.far=Math.max(30,distance+10);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 // Center the projected silhouette too: a long bonnet can offset its 3D bounds.
 let left=Infinity,right=-Infinity,bottom=Infinity,top=-Infinity;
 vertices(p=>{point.copy(p).project(camera);left=Math.min(left,point.x);right=Math.max(right,point.x);bottom=Math.min(bottom,point.y);top=Math.max(top,point.y);});
 const scale=Math.min(2*fill/(right-left),2*fill/(top-bottom));camera.zoom=scale;camera.updateProjectionMatrix();camera.projectionMatrix.elements[8]+=scale*(left+right)/2;camera.projectionMatrix.elements[9]+=scale*(top+bottom)/2;camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
}
