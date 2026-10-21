import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const art=path.join(root,'android/artwork/launcher-source.png');
const adaptiveArt=path.join(root,'android/artwork/launcher-adaptive-source.png');
const res=path.join(root,'android/res');
for(const [density,size] of Object.entries({mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192})){
 const dir=path.join(res,'mipmap-'+density);await fs.mkdir(dir,{recursive:true});
 await sharp(art).resize(size,size).png().toFile(path.join(dir,'ic_launcher.png'));
 await sharp(adaptiveArt).resize(size,size).png().toFile(path.join(dir,'ic_launcher_round.png'));
 const adaptiveSize=Math.round(size*108/48);
 await sharp(adaptiveArt).resize(adaptiveSize,adaptiveSize).png().toFile(path.join(dir,'ic_launcher_foreground.png'));
}
await fs.mkdir(path.join(root,'beta/artwork'),{recursive:true});
await sharp(art).resize(512,512).png().toFile(path.join(root,'beta/artwork/coastline-rush-icon-512.png'));
console.log('Generated density-specific launcher icons, adaptive foregrounds and 512px listing icon.');
