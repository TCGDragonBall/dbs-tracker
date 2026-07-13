const fs = require('fs');

let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// Replace CardListItem
content = content.replace(
  /const CardListItem = \(\{/,
  `const CardListItem = React.memo(({`
);

// We need to find where CardListItem ends and add `}, areEqualListItem);`
// CardListItem ends before `const CardItem = ({`
const cardItemIndex = content.indexOf('const CardItem = ({');
const endOfCardListItem = content.lastIndexOf('};', cardItemIndex);

if (endOfCardListItem !== -1) {
  content = content.substring(0, endOfCardListItem) + '});\n\nconst areEqualListItem = (prevProps: any, nextProps: any) => {\n  return prevProps.card.id === nextProps.card.id &&\n         prevProps.quantity === nextProps.quantity &&\n         prevProps.collectionGoal === nextProps.collectionGoal &&\n         prevProps.isSelected === nextProps.isSelected &&\n         prevProps.isMultiSelectMode === nextProps.isMultiSelectMode &&\n         prevProps.lang === nextProps.lang;\n};\n\n' + content.substring(endOfCardListItem + 2);
  
  // Wait, I should add `, areEqualListItem)` to the React.memo wrapper.
  // Actually, I can just replace `});` with `}, areEqualListItem);`
  content = content.replace(/}\);\n\nconst areEqualListItem =/, '}, areEqualListItem);\n\nconst areEqualListItem =');
}

// Replace CardItem
content = content.replace(
  /const CardItem = \(\{/,
  `const CardItem = React.memo(({`
);

// We need to find where CardItem ends. It ends before `const CustomIcon = `
const customIconIndex = content.indexOf('const CustomIcon = ');
const endOfCardItem = content.lastIndexOf('};', customIconIndex);

if (endOfCardItem !== -1) {
  content = content.substring(0, endOfCardItem) + '}, areEqualCardItem);\n\nconst areEqualCardItem = (prevProps: any, nextProps: any) => {\n  return prevProps.card.id === nextProps.card.id &&\n         prevProps.quantity === nextProps.quantity &&\n         prevProps.collectionGoal === nextProps.collectionGoal &&\n         prevProps.isSelected === nextProps.isSelected &&\n         prevProps.isMultiSelectMode === nextProps.isMultiSelectMode;\n};\n\n' + content.substring(endOfCardItem + 2);
}

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
console.log("Patched React.memo successfully!");
