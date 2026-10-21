import * as THREE from './vendor/three.module.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {bend as roadBend,rise as roadRise,heading as roadHeading} from './track.js';
import {sceneryForward} from './scenery.js';

// Each prop is a single mesh with vertex colours: detail without a draw call
// per window, leaf or deck. Geometry and materials are shared between copies.
const surface=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85});
function builder(){
 const parts=[];
 function add(geo,color,x=0,y=0,z=0,rx=0,ry=0,rz=0){
  const g=geo.index?geo.toNonIndexed():geo;g.deleteAttribute('uv');
  const matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(1,1,1));g.applyMatrix4(matrix);
  const c=new THREE.Color(color),colors=new Float32Array(g.attributes.position.count*3);for(let i=0;i<colors.length;i+=3){colors[i]=c.r;colors[i+1]=c.g;colors[i+2]=c.b;}g.setAttribute('color',new THREE.BufferAttribute(colors,3));parts.push(g);if(g!==geo)geo.dispose();
 }
 const box=(w,h,d,c,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>add(new THREE.BoxGeometry(w,h,d),c,x,y,z,rx,ry,rz);
 const cone=(r,h,c,x,y,z,segments=7)=>add(new THREE.ConeGeometry(r,h,segments),c,x,y,z);
 const cylinder=(rt,rb,h,c,x,y,z)=>add(new THREE.CylinderGeometry(rt,rb,h,7),c,x,y,z);
 return {add,box,cone,cylinder,finish(){const merged=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());merged.computeBoundingBox();const mesh=new THREE.Mesh(merged,surface);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;}};
}

function tree(kind){
 const b=builder(),bark='#806348';
 if(kind==='palm'){
  b.cylinder(.13,.24,4.3,bark,0,2.15,0);b.cylinder(.2,.2,.16,'#b49b6d',0,3.25,0);
  for(let i=0;i<7;i++){
   const a=i*Math.PI*2/7,verts=[0,4.6,0,Math.sin(a-.24)*1.2,4.35,Math.cos(a-.24)*1.2,Math.sin(a)*2.7,3.8,Math.cos(a)*2.7,0,4.6,0,Math.sin(a)*2.7,3.8,Math.cos(a)*2.7,Math.sin(a+.24)*1.2,4.35,Math.cos(a+.24)*1.2];
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.computeVertexNormals();b.add(g,i%2?'#4d8951':'#68984f');
   // Give the underside its own face so leaves remain visible from the road.
   const back=new THREE.BufferGeometry();const flipped=[];for(let j=0;j<verts.length;j+=9)flipped.push(...verts.slice(j+6,j+9),...verts.slice(j+3,j+6),...verts.slice(j,j+3));back.setAttribute('position',new THREE.Float32BufferAttribute(flipped,3));back.computeVertexNormals();b.add(back,'#47794b');
  }
 }else if(kind==='pine'){
  b.cylinder(.14,.23,2.4,bark,0,1.2,0);for(let i=0;i<3;i++)b.cone(1.5-i*.35,2.1-i*.18,['#3e6d54','#4f7e58','#639269'][i],0,2.4+i*.95,0);
 }else if(kind==='cypress'){
  b.cylinder(.12,.19,2.6,bark,0,1.3,0);b.add(new THREE.IcosahedronGeometry(1,1),'#4c7252',0,3,0);const mesh=b.finish();mesh.geometry.scale(.75,1.65,.75);mesh.geometry.computeBoundingBox();return mesh;
 }else{
  b.cylinder(.15,.28,2.5,bark,0,1.25,0);const shades=kind==='golden'?['#b9ad52','#d1bd63','#a8a553']:['#6f9454','#89a75c','#5d874f'];
  for(let i=0;i<4;i++){const a=i*2.2;b.add(new THREE.IcosahedronGeometry(i===0?1.65:1.25,1),shades[i%3],i===0?0:Math.sin(a)*1,3+(i%2)*.7,i===0?0:Math.cos(a)*.8);}
 }
 return b.finish();
}
function building(kind,tint){
 const b=builder(),glass='#52818a',trim='#f1dfb8',roof='#ae6650';
 const windows=(width,height,depth,floors)=>{for(let f=0;f<floors;f++)for(let j=0;j<3;j++){const y=1.4+f*1.7,z=-depth*.32+j*depth*.32;b.box(.06,.7,.62,glass,-width/2-.035,y,z);b.box(.65,.7,.06,glass,-width*.3+j*width*.3,y,depth/2+.035);}};
 if(kind==='house'){
  b.box(5,3.1,5.2,tint,0,1.55,0);b.add(new THREE.ConeGeometry(4.25,1.8,4),roof,0,3.95,0,0,Math.PI/4);
  b.box(1,1.9,.06,'#79644f',.8,.95,2.64);b.box(1.2,1,.08,glass,-1.2,1.8,2.65);b.box(.08,1,1.1,glass,-2.54,1.8,-.6);b.box(.5,1.3,.6,trim,1.2,4,0);
 }else if(kind==='apartments'){
  b.box(6,9.4,6.4,tint,0,4.7,0);b.box(6.4,.3,6.8,trim,0,9.5,0);windows(6,9.4,6.4,5);b.box(2,.8,2,'#b9bdb3',1,10.05,0);
  for(let i=0;i<4;i++)b.box(6.2,.13,6.6,trim,0,2.4+i*1.7,0);
 }else if(kind==='cafe'){
  b.box(6,3.4,5,tint,0,1.7,0);b.box(6.4,.28,5.4,trim,0,3.5,0);b.box(.07,1.8,3.4,glass,-3.04,1.6,0);
  for(let i=0;i<6;i++)b.box(1,.12,1.1,i%2?trim:'#cf7759',-3.5,2.85,-2.5+i,0,0,-.12);b.box(.18,2.6,.18,trim,-3.9,1.3,-2.4);b.box(.18,2.6,.18,trim,-3.9,1.3,2.4);
 }else{
  b.box(7,3,6,tint,0,1.5,0);b.box(7.4,.35,6.4,'#6c8589',0,3.1,0);b.box(.08,2.2,3.6,'#71807c',-3.54,1.1,0);b.box(.1,.35,3.7,trim,-3.58,2.5,0);b.box(7.8,.12,.5,trim,0,3.5,2.8);
 }
 b.box(kind==='house'?7:8,.12,kind==='house'?7.2:8,'#b9b59a',0,.02,0);
 return b.finish();
}
function vessel(kind){
 const b=builder(),white='#f1e7cc',blue='#407887',dark='#344e5d',red='#c86c53';
 const shape=new THREE.Shape();shape.moveTo(-1,-2.5);shape.lineTo(1,-2.5);shape.lineTo(1.2,1.6);shape.lineTo(0,3);shape.lineTo(-1.2,1.6);shape.closePath();
 const hull=new THREE.ExtrudeGeometry(shape,{depth:.65,bevelEnabled:false});hull.rotateX(Math.PI/2);b.add(hull,kind==='cargo'?red:blue,0,.65,0);b.box(1.9,.1,3.9,white,0,.69,-.3);
 if(kind==='sailboat'){
  b.cylinder(.035,.045,4.1,white,0,2.5,.1);
  const sail=new THREE.BufferGeometry();sail.setAttribute('position',new THREE.Float32BufferAttribute([0,4.5,.1,0,1.2,.1,0,1.2,2.3,0,4.5,.1,0,1.2,2.3,0,1.2,.1],3));sail.computeVertexNormals();b.add(sail,white);b.box(1,.45,1.1,white,0,.95,-.9);
 }else if(kind==='motorboat'){
  b.box(1.3,.65,1.6,white,0,1.05,-.5);b.box(1.31,.35,.08,blue,0,1.25,.34);b.box(1.6,.12,1.8,white,0,1.5,-.5);
 }else if(kind==='ferry'){
  b.box(1.8,.65,3.8,white,0,1.05,-.2);b.box(1.6,.65,3.1,white,0,1.7,-.5);b.box(1.85,.1,3.3,white,0,2.08,-.5);
  for(const x of [-.82,.82])for(let i=0;i<6;i++)b.box(.07,.3,.3,blue,x,1.75,-1.7+i*.48);b.box(.4,.6,.5,red,0,2.35,-1.3);b.cylinder(.025,.025,1,white,0,2.6,.6);
 }else{
  b.box(1.8,1.3,1.1,white,0,1.35,-1.65);b.box(1.85,.3,.08,blue,0,1.75,-1.05);b.box(.45,.7,.5,dark,0,2.25,-1.8);
  for(let i=0;i<3;i++)for(let j=0;j<2;j++)b.box(.85,.5,.8,[red,'#d6b16b','#648f87'][(i+j)%3],-.46+j*.92,1.0,-.45+i*.9);
 }
 // Stylised wake follows the hull; no particles or per-boat lights.
 b.box(.09,.015,2.8,'#8bb9ba',-1.35,.02,-2.2,0,.18);b.box(.09,.015,2.8,'#8bb9ba',1.35,.02,-2.2,0,-.18);
 const mesh=b.finish();mesh.castShadow=false;return mesh;
}
function lamp(){
 const b=builder();b.cylinder(.09,.15,6.6,'#53656b',0,3.3,0);b.cylinder(.2,.25,.35,'#6d7c7a',0,.175,0);b.box(1.8,.12,.14,'#53656b',-.8,6.55,0,0,0,.08);b.box(.85,.18,.4,'#455b61',-1.45,6.45,0);b.box(.7,.04,.32,'#ede8c6',-1.45,6.34,0);return b.finish();
}
export function createCoast(scene,details={}){
 let trackMode='race';const bend=(f,d)=>roadBend(f,d,trackMode),rise=(f,d)=>roadRise(f,d,trackMode),heading=(f,d)=>roadHeading(f,d,trackMode);
 function imported(name,size,axis='y'){const source=details[name];if(!source)return null;const root=source.clone(true),box=new THREE.Box3().setFromObject(root),dimensions=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());root.position.sub(new THREE.Vector3(center.x,box.min.y,center.z));const wrapper=new THREE.Group();wrapper.add(root);wrapper.scale.setScalar(size/dimensions[axis]);root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});const placed=new THREE.Group();placed.add(wrapper);return placed;}
 const trees=[],buildings=[],boats=[],lamps=[],landmarks=[],bulbMaterial=new THREE.MeshStandardMaterial({color:'#fff0bd',emissive:'#ffd589',emissiveIntensity:0,roughness:.5});
 const treeKinds=['palm','pine','broadleaf','birch','maple'],treeModels=['texturedPalm','texturedPine','texturedBirch','texturedBirchTall','texturedMaple'].map((n,i)=>imported(n,i===0?6.5:i===1?6:4.8)||tree(treeKinds[i]));
 for(let i=0;i<48;i++){
  const coast=i%2===0,kind=coast?(i%6===0?0:i%5):(i*3+1)%5,t=treeModels[kind].clone();t.scale.setScalar(.78+(i%5)*.12);t.rotation.y=i*2.4;
  t.userData={anchor:-16+Math.floor(i/2)*14,x:coast?-10.2-(i%3)*1.3:10+(i%3)*1.6,kind:treeKinds[kind]};scene.add(t);trees.push(t);
 }
 const kinds=['house','cafe','house','apartments','workshop','house','apartments','cafe','house','workshop','apartments','house'];
 const tints=['#e4cfa1','#d7d9ba','#cfab8d','#c8d3cb','#d9bf98','#abc2b2'];
 kinds.forEach((kind,i)=>{const m=building(kind,tints[i%tints.length]);m.userData={anchor:34+i*33,x:kind==='apartments'?29+i%2*8:18+i%3*4,kind};m.rotation.y=i%2?.12:-.08;scene.add(m);buildings.push(m);});
 const tower=builder();for(const x of [-1.3,1.3])for(const z of [-1.3,1.3])tower.box(.2,7,.2,'#7c8c87',x,3.5,z);tower.cylinder(2,2,2.6,'#c5d3c6',0,7.6,0);tower.cone(2.3,1,'#6d9693',0,9.4,0);tower.box(3,.15,3,'#8a9a92',0,5.9,0);const waterTower=tower.finish();waterTower.userData={anchor:165,x:38,kind:'water-tower'};scene.add(waterTower);landmarks.push(waterTower);
 const vesselSpecs=[['sailboat',-27,54,1.1],['motorboat',-34,146,1.25],['ferry',-55,112,2.8],['cargo',-105,205,4.6],['sailboat',-31,265,1.15],['ferry',-70,300,2.9],['cargo',-128,90,4.9],['motorboat',-40,340,1.1]];
 vesselSpecs.forEach(([kind,x,anchor,scale],i)=>{const importedNames={sailboat:'boat-sail-a',motorboat:'boat-speed-a',ferry:'ship-ocean-liner-small',cargo:'ship-cargo-a'};const m=imported(importedNames[kind],5.5,'z')||vessel(kind);m.scale.setScalar(scale);m.userData={anchor,x,kind,angle:Math.PI/2+(i%2?.18:-.18)};scene.add(m);boats.push(m);});
 const lampModel=lamp(),bulbGeo=new THREE.BoxGeometry(.69,.035,.31);
 for(let i=0;i<12;i++){const root=new THREE.Group();root.add(lampModel.clone());const bulb=new THREE.Mesh(bulbGeo,bulbMaterial);bulb.position.set(-1.45,6.315,0);root.add(bulb);root.userData={anchor:10+i*28,x:7.35,kind:'lamp'};scene.add(root);lamps.push(root);}
 function place(m,distance,span,behind){const f=sceneryForward(m.userData.anchor,distance,span,behind);m.position.set(m.userData.x+bend(f,distance),rise(f,distance),-f);return f;}
 return {trees,buildings,boats,lamps,landmarks,bulbMaterial,update(distance,time,mode='race'){trackMode=mode;
  trees.forEach(t=>place(t,distance,364,40));
  buildings.forEach(m=>{const f=place(m,distance,440,75);m.rotation.y=-heading(f,distance)+(m.userData.anchor%2?.12:-.08);});
  landmarks.forEach(m=>place(m,distance,440,75));
  lamps.forEach(m=>{const f=place(m,distance,336,36);m.rotation.y=-heading(f,distance);});
  boats.forEach((m,i)=>{const f=place(m,distance,440,90);m.position.y-=.11;m.position.y+=Math.sin(time*.9+i)*.045;m.rotation.set(Math.sin(time*.7+i)*.012,m.userData.angle-heading(f,distance),Math.sin(time*.8+i)*.015);});
 }};
}
