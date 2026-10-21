import fs from 'node:fs';
const p='coast-rush/dist/audio.js';fs.writeFileSync(p,fs.readFileSync(p,'utf8').replaceAll('g.connect(this.master);','g.connect(this.effectOutput||this.master);'));
const m='android/AndroidManifest.xml';fs.writeFileSync(m,fs.readFileSync(m,'utf8').replace('versionCode="15"','versionCode="16"').replace('versionName="1.14"','versionName="1.15"'));
