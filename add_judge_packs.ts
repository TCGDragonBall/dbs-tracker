import * as fs from 'fs';
import * as path from 'path';

const file = path.join(process.cwd(), 'src', 'data', 'fusion_world.ts');
let content = fs.readFileSync(file, 'utf8');

const cardsToAdd = `
FB01-007_JSP01	Gohan : Youth	UC*	Battle	Red	JSP01
FB01-008_JSP01	Gohan : Youth	C*	Battle	Red	JSP01
FB01-016_JSP01	Super Saiyan God Goku	SR*	Battle	Red	JSP01
FB01-037_JSP01	Goku Black	SR*	Battle	Blue	JSP01
FB01-081_JSP01	Dr. Gero	C*	Battle	Green	JSP01
FB01-098_JSP01	Broly	C*	Battle	Green	JSP01
FB01-108_JSP01	Frieza	UC*	Battle	Yellow	JSP01
FB01-136_JSP01	Time Rewound	UC*	Extra	Yellow	JSP01
FS02-10_JSP01	Vegeta	C*	Battle	Blue	JSP01
FS04-09_JSP01	Frieza	R*	Battle	Yellow	JSP01

FB02-029_JSP02	Top	UC*	Battle	Red	JSP02
FB02-040_JSP02	Zamasu	UC*	Battle	Blue	JSP02
FB03-018_JSP02	Android 17	SR*	Battle	Red	JSP02
FB03-036_JSP02	Zeno	UC*	Battle	Red	JSP02
FB03-066_JSP02	Goku Black	R*	Battle	Blue	JSP02
FB03-071_JSP02	Bulma	C*	Battle	Blue	JSP02
FB03-084_JSP02	Android 17	SR*	Battle	Green	JSP02
FB03-094_JSP02	Piccolo	C*	Battle	Green	JSP02
FB03-132_JSP02	Sorbet	C*	Battle	Yellow	JSP02
FS05-13_JSP02	Frieza	C*	Battle	Yellow	JSP02

FB04-007_JSP03	Piccolo	C*	Battle	Red	JSP03
FB04-042_JSP03	Vegeta	C*	Battle	Blue	JSP03
FB04-060_JSP03	SSGSS Vegito	UC*	Battle	Blue	JSP03
FB04-072_JSP03	Bulma	C*	Battle	Green	JSP03
FB04-089_JSP03	SSGS Evolved Vegeta	R*	Battle	Green	JSP03
FB04-092_JSP03	Nail	UC*	Battle	Green	JSP03
FB04-112_JSP03	Frieza	UC*	Battle	Yellow	JSP03
FB04-125_JSP03	Cooler	C*	Battle	Yellow	JSP03
FS06-05_JSP03	Cheelai	R*	Battle	Green	JSP03
FS07-06_JSP03	Great Ape Vegeta	C*	Battle	Yellow	JSP03

FB01-007_JEP01	Gohan : Youth	UC*	Battle	Red	JEP01
FB01-008_JEP01	Gohan : Youth	C*	Battle	Red	JEP01
FB01-016_JEP01	Super Saiyan God Goku	SR*	Battle	Red	JEP01
FB01-037_JEP01	Goku Black	SR*	Battle	Blue	JEP01
FB01-081_JEP01	Dr. Gero	C*	Battle	Green	JEP01
FB01-098_JEP01	Broly	C*	Battle	Green	JEP01
FB01-108_JEP01	Frieza	UC*	Battle	Yellow	JEP01
FB01-136_JEP01	Time Rewound	UC*	Extra	Yellow	JEP01
FS02-10_JEP01	Vegeta	C*	Battle	Blue	JEP01
FS04-09_JEP01	Frieza	R*	Battle	Yellow	JEP01

FB02-029_JEP02	Top	UC*	Battle	Red	JEP02
FB02-040_JEP02	Zamasu	UC*	Battle	Blue	JEP02
FB03-018_JEP02	Android 17	SR*	Battle	Red	JEP02
FB03-036_JEP02	Zeno	UC*	Battle	Red	JEP02
FB03-066_JEP02	Goku Black	R*	Battle	Blue	JEP02
FB03-071_JEP02	Bulma	C*	Battle	Blue	JEP02
FB03-084_JEP02	Android 17	SR*	Battle	Green	JEP02
FB03-094_JEP02	Piccolo	C*	Battle	Green	JEP02
FB03-132_JEP02	Sorbet	C*	Battle	Yellow	JEP02
FS05-13_JEP02	Frieza	C*	Battle	Yellow	JEP02

FB04-007_JEP03	Piccolo	C*	Battle	Red	JEP03
FB04-042_JEP03	Vegeta	C*	Battle	Blue	JEP03
FB04-060_JEP03	SSGSS Vegito	UC*	Battle	Blue	JEP03
FB04-072_JEP03	Bulma	C*	Battle	Green	JEP03
FB04-089_JEP03	SSGS Evolved Vegeta	R*	Battle	Green	JEP03
FB04-092_JEP03	Nail	UC*	Battle	Green	JEP03
FB04-112_JEP03	Frieza	UC*	Battle	Yellow	JEP03
FB04-125_JEP03	Cooler	C*	Battle	Yellow	JEP03
FS06-05_JEP03	Cheelai	R*	Battle	Green	JEP03
FS07-06_JEP03	Great Ape Vegeta	C*	Battle	Yellow	JEP03
`;

content = content.replace('\`;', cardsToAdd + '\n\`;');
fs.writeFileSync(file, content);
console.log('Added cards to fusion_world.ts');
