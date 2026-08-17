const fs = require('fs');

const path = 'src/TrackerApp.tsx';
let content = fs.readFileSync(path, 'utf-8');

const target = `const ModalCard = ({ selectedCard, isFlipped, setIsFlipped }: { selectedCard: Card, isFlipped: boolean, setIsFlipped: (f: boolean) => void }) => {
  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className="relative w-full max-w-sm aspect-[2/3] cursor-pointer mx-auto transition-transform duration-300"
    >`;

const replacement = `const ModalCard = ({ selectedCard, isFlipped, setIsFlipped }: { selectedCard: Card, isFlipped: boolean, setIsFlipped: (f: boolean) => void }) => {
  const isHorizontal = isHorizontalFormat(selectedCard);
  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className={\`relative w-full \${isHorizontal ? 'max-w-xl aspect-[1.8/1] sm:aspect-[2/1]' : 'max-w-sm aspect-[2/3]'} cursor-pointer mx-auto transition-transform duration-300\`}
    >`;

content = content.replace(target, replacement);

// And we also fix the object-cover object-top to object-contain, or object-cover if it fits well. object-contain might be better to avoid cropping. Let's look.
const targetImg1 = `          <img src={selectedCard.imageUrl || \`https://picsum.photos/seed/\${selectedCard.id}/400/600\`} alt={selectedCard.name} className="w-full h-full object-cover object-top" />`;
const replImg1 = `          <img src={selectedCard.imageUrl || \`https://picsum.photos/seed/\${selectedCard.id}/400/600\`} alt={selectedCard.name} className={\`w-full h-full \${isHorizontal ? 'object-contain' : 'object-cover object-top'}\`} />`;

const targetImg2 = `          <img src={selectedCard.backImageUrl || selectedCard.imageUrl || \`https://picsum.photos/seed/\${selectedCard.id}/400/600\`} alt="Back" className="w-full h-full object-cover" />`;
const replImg2 = `          <img src={selectedCard.backImageUrl || selectedCard.imageUrl || \`https://picsum.photos/seed/\${selectedCard.id}/400/600\`} alt="Back" className={\`w-full h-full \${isHorizontal ? 'object-contain' : 'object-cover'}\`} />`;

content = content.replace(targetImg1, replImg1).replace(targetImg2, replImg2);

fs.writeFileSync(path, content, 'utf-8');
console.log('Fixed ModalCard');
