
import { calculateTune, CarSpecs, TuneType, TuneVariant, tuneVariantsByType } from './src/lib/tuningCalculator';

const baseSpecs: CarSpecs = {
  weight: 3000,
  weightDistribution: 52,
  driveType: 'RWD',
  piClass: 'S1',
  hasAero: true,
  frontDownforce: 200,
  rearDownforce: 300,
  tireCompound: 'slick',
  horsepower: 700,
  gearCount: 6,
  frontTireWidth: 245,
  rearTireWidth: 285,
};

const types: TuneType[] = ['grip', 'street', 'rally', 'offroad', 'drag']; // Drift was just done

console.log('--- Template Variance Analysis ---');
console.log(`Car: 3000lbs, 52% Front, RWD, S1, 700HP`);

types.forEach(type => {
  console.log(`\n=== TYPE: ${type.toUpperCase()} ===`);
  const variants = tuneVariantsByType[type];
  
  // Table header
  console.log(
    'Variant'.padEnd(15) + 
    'Springs(F/R)'.padEnd(15) + 
    'Damp(Reb/Bump)'.padEnd(18) + 
    'Align(Cam/Toe)'.padEnd(18) + 
    'Diff(A/D)'.padEnd(15) +
    'Brakes(%)'.padEnd(10)
  );
  
  variants.forEach(v => {
    const tune = calculateTune(baseSpecs, type, { variant: v.value });
    
    const springs = `${tune.springsFront}/${tune.springsRear}`;
    const damp = `${tune.reboundFront}/${tune.bumpFront}`;
    const align = `${tune.camberFront}/${tune.toeFront}`;
    const diff = `${tune.diffAccelRear}/${tune.diffDecelRear}`;
    const brakes = `${tune.brakeBalance}`;
    
    console.log(
      v.value.substring(0, 14).padEnd(15) + 
      springs.padEnd(15) + 
      damp.padEnd(18) + 
      align.padEnd(18) + 
      diff.padEnd(15) +
      brakes.padEnd(10)
    );
  });
});
