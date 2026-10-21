import fs from 'node:fs';
const root='coast-rush/dist/';
let p=fs.readFileSync(root+'physics.js','utf8');
p="import {updateShortcutTerrain} from './shortcut-terrain.js';\n"+p;
p=p.replace("shortcutsCompleted:0};}","shortcutsCompleted:0,shortcutLift:0,shortcutPitch:0,shortcutRoll:0,shortcutAir:false,shortcutRampHits:[],shortcutPropHits:[]};}");
p=p.replace("if(s.gameMode==='career'){\n  if(s.sinceSpawn", "updateShortcutTerrain(s,oldDistance);\n if(s.gameMode==='career'){\n  if(s.sinceSpawn");
fs.writeFileSync(root+'physics.js',p);
let scene=fs.readFileSync(root+'scene.js','utf8');
scene=scene.replace('.04+(s.jumpY||0)+(s.rampLift||0)', '.04+(s.jumpY||0)+(s.rampLift||0)+(s.shortcutLift||0)');
scene=scene.replace('Math.atan(roadGrade(d,trackMode));player.rotation.y', 'Math.atan(roadGrade(d,trackMode))+(s.shortcutPitch||0);player.rotation.y');
scene=scene.replace('s.rail?Math.sin(d*5)*.025:0,.3)', 's.rail?Math.sin(d*5)*.025:-(s.shortcutRoll||0),.3)');
scene=scene.replace('.28+(s.jumpY||0)+(s.rampLift||0)', '.28+(s.jumpY||0)+(s.rampLift||0)+(s.shortcutLift||0)');
fs.writeFileSync(root+'scene.js',scene);
let view=fs.readFileSync(root+'shortcut-view.js','utf8');
view="import {shortcutChallenges,shortcutSurface} from './shortcut-terrain.js';\n"+view;
view=view.replace('segments=100','segments=240');
view=view.replace("material.color.set('#9da8b6');", "material.color.set('#a4a196');material.roughness=1;material.vertexColors=true;const colors=new Float32Array((segments+1)*6);geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));");
view=view.replace("let last='';", `let last='';
 const obstacles=new THREE.Group();root.add(obstacles);let challengeKey='';
 const rampSigns=new THREE.Group();root.add(rampSigns);
 const propMaterials=[new THREE.MeshStandardMaterial({color:'#eb712c',roughness:.8}),new THREE.MeshStandardMaterial({color:'#e7e8d5',roughness:.7}),new THREE.MeshStandardMaterial({color:'#514c43',roughness:1}),new THREE.MeshStandardMaterial({color:'#171e24',roughness:.85})];
 const patchMaterial=new THREE.MeshStandardMaterial({color:'#716b5a',roughness:1,polygonOffset:true,polygonOffsetFactor:-1});
 const propMesh=(group,geo,material,x,y,z)=>{const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;group.add(m);return m;};
 const clearProps=()=>{for(const group of [obstacles,rampSigns]){group.traverse(o=>{if(o.isMesh)o.geometry.dispose();});group.clear();}};
 function buildProps(path){clearProps();challengeKey=path.id;for(const o of shortcutChallenges(path).obstacles){const group=new THREE.Group();group.userData.challenge=o;obstacles.add(group);if(o.kind==='cone'){for(const dx of [-.2,.2]){propMesh(group,new THREE.BoxGeometry(.38,.07,.38),propMaterials[3],dx,.035,0);propMesh(group,new THREE.ConeGeometry(.17,.65,12),propMaterials[0],dx,.37,0);propMesh(group,new THREE.CylinderGeometry(.085,.115,.13,12),propMaterials[1],dx,.39,0);}}else if(o.kind==='barrier'){propMesh(group,new THREE.BoxGeometry(.95,.55,.3),propMaterials[0],0,.35,0);for(let i=0;i<3;i++){const stripe=propMesh(group,new THREE.BoxGeometry(.15,.56,.315),propMaterials[1],-.32+i*.32,.35,0);stripe.rotation.z=-.3;}for(const x of [-.36,.36])propMesh(group,new THREE.BoxGeometry(.12,.16,.48),propMaterials[3],x,.08,0);}else{const rock=propMesh(group,new THREE.DodecahedronGeometry(.47,1),propMaterials[2],0,.25,0);rock.scale.set(1.25,.65,.85);rock.rotation.set(.3,.6,.2);propMesh(group,new THREE.DodecahedronGeometry(.18,0),propMaterials[2],.38,.12,.22);}}
 for(const r of shortcutChallenges(path).ramps){const g=new THREE.Group();g.userData.crest=r;rampSigns.add(g);for(const x of [-1.9,1.9]){const marker=propMesh(g,new THREE.BoxGeometry(.18,.06,1.3),propMaterials[0],x,0,0);marker.rotation.y=.22*(x>0?-1:1);}}
 }
`);
view=view.replace("const track=s.trackProfile,d=s.distance,span=p.end-p.start", "if(challengeKey!==p.id)buildProps(p);const track=s.trackProfile,d=s.distance,span=p.end-p.start");
view=view.replace("positions.set([q.x+(side?2.2:-2.2),q.y,-q.f],k);", "const lateral=side?2.2:-2.2;positions.set([q.x+lateral,q.y+shortcutSurface(p,q.a,lateral),-q.f],k);const rough=q.a>p.entry+12&&q.a<p.exit-12,shade=rough?.64+.13*Math.sin(q.a*.43)*Math.sin(q.a*.77):.96;colors.set([shade,shade*(track.startsWith('city-')?1:.95),shade*(track.startsWith('city-')?1:.82)],k);");
view=view.replace('geometry.attributes.position.needsUpdate=geometry.attributes.uv.needsUpdate=true;', 'geometry.attributes.color.needsUpdate=geometry.attributes.position.needsUpdate=geometry.attributes.uv.needsUpdate=true;');
view=view.replace('(a.y+b.y)/2+.36-(open?20:0)', '(a.y+b.y)/2+.36+shortcutSurface(p,mid,side?2.15:-2.15)-(open?20:0)');
view=view.replace('a.y+.015,-a.f,shown?b.x:a.x,shown?b.y+.015:a.y+.015', 'a.y+.015+shortcutSurface(p,a.a),-a.f,shown?b.x:a.x,shown?b.y+.015+shortcutSurface(p,b.a):a.y+.015+shortcutSurface(p,a.a)');
view=view.replace('rails.instanceMatrix.needsUpdate=true;', `obstacles.children.forEach(g=>{const o=g.userData.challenge,f=o.distance-d;g.position.set(shortcutOffset(p,o.distance)+bend(f,d,track)+o.x,rise(f,d,track)+.095+shortcutSurface(p,o.distance,o.x),-f);g.rotation.set(0,-Math.atan(p.chordSlope-slope(d,track)),s.shortcutPropHits?.includes(o.id)?1.15:0);g.visible=f>-25&&f<300;});
  rampSigns.children.forEach(g=>{const r=g.userData.crest,f=r.distance-d;g.position.set(shortcutOffset(p,r.distance)+bend(f,d,track),rise(f,d,track)+.13+shortcutSurface(p,r.distance),-f);g.rotation.y=-Math.atan(p.chordSlope-slope(d,track));g.visible=f>-25&&f<300;});
  rails.instanceMatrix.needsUpdate=true;`);
view=view.replace("+' · NARROW'", "+' · ROUGH / RAMPS'");
view=view.replace('dispose(){geometry.dispose();', 'dispose(){clearProps();propMaterials.forEach(m=>m.dispose());patchMaterial.dispose();geometry.dispose();');
fs.writeFileSync(root+'shortcut-view.js',view);
