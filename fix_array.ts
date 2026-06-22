import fs from 'fs';

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// Revert MASTERS_TP07
app = app.replace(
  /'MASTERS_TP07': \['SEALED_TP07', 'P-126', 'P-127', 'P-128', 'P-129', 'P-130', 'P-131', 'P-132', 'P-133', 'P-138', 'P-139', 'P-140', 'P-141', 'P-142'\]/g,
  "'MASTERS_TP07': ['SEALED_TP07', 'P-126', 'P-127', 'P-128', 'P-129', 'P-130', 'P-131', 'P-132', 'P-133']"
);

// Add to foil list
const matchStr = " 'P-132', 'P-133'].includes";
const replaceStr = " 'P-132', 'P-133', 'P-138', 'P-139', 'P-140', 'P-141', 'P-142'].includes";
if (app.includes(matchStr)) {
    app = app.replace(matchStr, replaceStr);
}

fs.writeFileSync('src/TrackerApp.tsx', app);
console.log('Fixed TrackerApp.tsx properly');
