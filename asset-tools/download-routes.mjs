import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('coast-rush/dist/assets/routes');
async function download(url,dest){await fs.mkdir(path.dirname(dest),{recursive:true});try{if((await fs.stat(dest)).size>100)return;}catch{}const r=await fetch(url);if(!r.ok)throw Error(`${r.status} ${url}`);await fs.writeFile(dest,new Uint8Array(await r.arrayBuffer()));console.log(path.relative(root,dest));}
const models=['rock_face_01','boulder_01','modular_urban_apartments_facade'];
for(const id of models){const data=JSON.parse(await fs.readFile(`downloads/${id}-files.json`));const item=data.gltf['2k'].gltf;await download(item.url,path.join(root,id,`${id}_2k.gltf`));await Promise.all(Object.entries(item.include).map(([name,f])=>download(f.url,path.join(root,id,name))));}
for(const id of ['concrete_wall_006','rock_face_03']){const data=JSON.parse(await fs.readFile(`downloads/${id}-files.json`));await Promise.all(['Diffuse','nor_gl','Rough','arm'].filter(k=>data[k]?.['2k']?.jpg).map(k=>{const item=data[k]['2k'].jpg;return download(item.url,path.join(root,id,path.basename(new URL(item.url).pathname)));}));}
