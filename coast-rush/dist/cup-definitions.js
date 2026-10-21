const round=(route,world,km,name)=>({route,world,raceLength:km*1000,name});
export const CUPS=[
 {id:'coastline',name:'Coastline Cup',level:'easy',tier:'ROOKIE',previous:null,multiplier:1,rounds:[round('coast','coast',3,'Coastal opener'),round('city','night',4,'Midnight skyline'),round('mountain','coast',3,'Ridge runners'),round('coast','rain',5,'Storm chase'),round('city','night',6,'Neon finale')]},
 {id:'neon',name:'Neon Circuit',level:'medium',tier:'PRO',previous:'coastline',multiplier:1.5,rounds:[round('city','night',4,'City lights'),round('coast','rain',5,'Wet waterfront'),round('city','rain',4,'Rain on chrome'),round('mountain','night',6,'After-dark ascent'),round('city','night',5,'Neon pursuit'),round('coast','night',6,'Moonlit coast'),round('city','rain',7,'Circuit showdown')]},
 {id:'masters',name:'Rush Masters',level:'hard',tier:'ELITE',previous:'neon',multiplier:2,rounds:[round('coast','night',4,'Masters opener'),round('mountain','snow',5,'Frozen ascent'),round('city','rain',6,'Urban storm'),round('mountain','coast',5,'Knife-edge pass'),round('coast','rain',7,'Coastal endurance'),round('city','night',6,'Midnight rush'),round('mountain','snow',8,'Summit challenge'),round('coast','rain',7,'Storm breakers'),round('city','night',9,'The penultimate'),round('mountain','night',10,'Masters finale')]}
];
export const cupDefinition=id=>CUPS.find(c=>c.id===id)||CUPS[0];
export const cupRounds=cup=>cupDefinition(cup?.cupKey).rounds;
export const cupComplete=cup=>!!cup&&cup.results.length===cupRounds(cup).length;
export function unlockedCups(book){const unlocked=new Set(['coastline',...(Array.isArray(book?.unlocked)?book.unlocked:[]).filter(k=>CUPS.some(c=>c.id===k))]);for(const c of CUPS)if(c.previous&&book?.records?.some(r=>(r.cupKey||'coastline')===c.previous&&Number.isInteger(r.place)&&r.place>=1&&r.place<=3))unlocked.add(c.id);return [...unlocked];}
export const cupUnlocked=(profile,key)=>CUPS.some(c=>c.id===key)&&unlockedCups(profile.championship).includes(key);
export function nextCupChoice(profile){const active=profile.championship.active,current=CUPS.findIndex(c=>c.id===(active?.cupKey||'coastline'));return CUPS.slice(current+1).find(c=>cupUnlocked(profile,c.id))?.id||CUPS.find(c=>cupUnlocked(profile,c.id)&&!profile.championship.records.some(r=>(r.cupKey||'coastline')===c.id&&r.place<=3))?.id||'coastline';}
