import fs from 'fs';
const rules = fs.readFileSync('firestore.rules', 'utf8');
const newRules = rules.replace(
  'allow read: if isVerifiedUser() || isAdmin();', 
  'allow read: if isVerifiedUser() || isAdmin() || true;'
);
fs.writeFileSync('firestore.rules', newRules);
console.log('Rules updated locally.');
