import fs from 'fs';

// Update sealed.ts
let sealed = fs.readFileSync('src/data/sealed.ts', 'utf8');

if (!sealed.includes('SEALED_EVENT_PACK_03')) {
    sealed = sealed.replace(
        /SEALED_EVENT_PACK_02\tEvent Pack 02.*\n/,
        "$&SEALED_EVENT_PACK_03\tEvent Pack 03\t-\tSealed\t-\tSEALED_EVENT_PACK_03\t-\t-\t-\t-\t-\t-\t-\t-\nSEALED_EVENT_PACK_04\tEvent Pack 04\t-\tSealed\t-\tSEALED_EVENT_PACK_04\t-\t-\t-\t-\t-\t-\t-\t-\n"
    );
}

if (!sealed.includes('SEALED_TP08')) {
    sealed = sealed.replace(
        /SEALED_TP07\tTournament Pack 07.*\n/,
        "$&SEALED_TP08\tTournament Pack 08\t-\tSealed\t-\tSEALED_TP08\t-\t-\t-\t-\t-\t-\t-\t-\n"
    );
}
fs.writeFileSync('src/data/sealed.ts', sealed);
console.log('Sealed info updated');
