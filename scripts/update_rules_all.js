import fs from 'fs';
let rules = fs.readFileSync('firestore.rules', 'utf8');

// replace all "allow list: if ..." with "allow list: if true;" for lists
rules = rules.replace(
  'allow list: if isVerifiedUser() && (resource.data.ownerId == request.auth.uid || resource.data.isPublic == true || isAdmin());',
  'allow list: if true;'
);

fs.writeFileSync('firestore.rules', rules);
console.log('Rules updated locally.');
