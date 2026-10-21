import assert from 'node:assert/strict';
import * as THREE from './coast-rush/dist/vendor/three.module.js';
import {fitCarPreview} from './coast-rush/dist/car-preview-fit.js';
for(const aspect of [.6,1,2.333,4])for(const dimensions of [[1.45,.9,2.97],[1.45,.99,3.33],[1.45,.86,3.07],[1.45,1,3.51],[1.45,.66,2.49]]){
 const root=new THREE.Group(),mesh=new THREE.Mesh(new THREE.BoxGeometry(...dimensions));mesh.position.y=dimensions[1]/2;root.add(mesh);root.rotation.y=-.45;
 const wing=new THREE.Mesh(new THREE.BoxGeometry(1.6,.1,.35));wing.position.set(0,1.25,-1.3);root.add(wing);
 const camera=new THREE.PerspectiveCamera(35,1,.1,30);fitCarPreview(camera,root,aspect);let occupied=0;
 root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.getAttribute('position');for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).project(camera);assert(Math.abs(v.x)<=.86001&&Math.abs(v.y)<=.86001,'Complete body and custom wing must fit with margin');assert(v.z>-1&&v.z<1);occupied=Math.max(occupied,Math.abs(v.x),Math.abs(v.y));}});
 assert(occupied>.85,'A fitted preview must use the available frame');assert.equal(camera.aspect,aspect);
 mesh.geometry.dispose();wing.geometry.dispose();
}
const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([-1,0,0,1,0,0,0,1,0,100,100,100],3));geometry.setIndex([0,1,2]);const indexed=new THREE.Mesh(geometry),camera=new THREE.PerspectiveCamera(35,1,.1,30);fitCarPreview(camera,indexed,1);assert(camera.position.length()<10,'Unused accessor vertices must not shrink the visible model');geometry.dispose();
console.log('PASS: all five body proportions and custom wings fit, fill the frame and remain unclipped across tall, square and wide preview sizes; unused vertices ignored');
