// Keep a restart tied to the setup used by this run, even if the menu changes.
export function captureRunSetup(profile,mode,density,spec,level,appearance) {
 return {mode,density,route:profile.route,level,car:profile.car,world:profile.world,
  spec:{...spec,upgradeLevels:{...spec.upgradeLevels}},appearance:{...appearance}};
}
export function stampRunSetup(active,setup) {
 Object.assign(active,{car:setup.car,world:setup.world,route:setup.route,
  raceLength:setup.raceLength||3000,cupRounds:setup.cupRounds,difficulty:setup.mode!=='career'?setup.level:setup.density,
  upgrades:{...setup.spec.upgradeLevels},appearance:{...setup.appearance}});
}
