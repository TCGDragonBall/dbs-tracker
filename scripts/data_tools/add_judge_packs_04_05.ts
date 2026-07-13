import * as fs from 'fs';
import * as path from 'path';

const file = path.join(process.cwd(), 'src', 'data', 'fusion_world.ts');
let content = fs.readFileSync(file, 'utf8');

const cardsToAdd = `
FB05-011_JSP04	Neva : DA	C*	Battle	Red	JSP04
FB05-018_JSP04	Vegeta (Mini) : DA	UC*	Battle	Red	JSP04
FB05-041_JSP04	Vegito	R*	Battle	Blue	JSP04
FB05-062_JSP04	Bulma	R*	Battle	Green	JSP04
FB05-083_JSP04	Bio-Broly	R*	Battle	Yellow	JSP04
FB05-114_JSP04	South Kai	C*	Battle	Black	JSP04
FB06-026_JSP04	Announcer	C*	Battle	Blue	JSP04
FB06-061_JSP04	Broly : BR	UC*	Battle	Green	JSP04
FB06-085_JSP04	Marba : DA	R*	Battle	Yellow	JSP04
FB06-108_JSP04	King Piccolo	R*	Battle	Black	JSP04

FB05-011_JEP04	Neva : DA	C*	Battle	Red	JEP04
FB05-018_JEP04	Vegeta (Mini) : DA	UC*	Battle	Red	JEP04
FB05-041_JEP04	Vegito	R*	Battle	Blue	JEP04
FB05-062_JEP04	Bulma	R*	Battle	Green	JEP04
FB05-083_JEP04	Bio-Broly	R*	Battle	Yellow	JEP04
FB05-114_JEP04	South Kai	C*	Battle	Black	JEP04
FB06-026_JEP04	Announcer	C*	Battle	Blue	JEP04
FB06-061_JEP04	Broly : BR	UC*	Battle	Green	JEP04
FB06-085_JEP04	Marba : DA	R*	Battle	Yellow	JEP04
FB06-108_JEP04	King Piccolo	R*	Battle	Black	JEP04

FB07-007_JSP05	Cell	R*	Battle	Red	JSP05
FB07-011_JSP05	Son Goku (Mini) : DA	R*	Battle	Red	JSP05
FB07-027_JSP05	Syn Shenron	R*	Battle	Blue	JSP05
FB07-043_JSP05	Oceanus Shenron	C*	Battle	Blue	JSP05
FB07-063_JSP05	Pan : SH	R*	Battle	Green	JSP05
FB07-069_JSP05	Broly : BR	R*	Battle	Green	JSP05
FB07-080_JSP05	King Cold	R*	Battle	Yellow	JSP05
FB07-085_JSP05	Chilled	C*	Battle	Yellow	JSP05
FB07-103_JSP05	Krillin	R*	Battle	Black	JSP05
FB07-116_JSP05	Vegeta	C*	Battle	Black	JSP05

FB07-007_JEP05	Cell	R*	Battle	Red	JEP05
FB07-011_JEP05	Son Goku (Mini) : DA	R*	Battle	Red	JEP05
FB07-027_JEP05	Syn Shenron	R*	Battle	Blue	JEP05
FB07-043_JEP05	Oceanus Shenron	C*	Battle	Blue	JEP05
FB07-063_JEP05	Pan : SH	R*	Battle	Green	JEP05
FB07-069_JEP05	Broly : BR	R*	Battle	Green	JEP05
FB07-080_JEP05	King Cold	R*	Battle	Yellow	JEP05
FB07-085_JEP05	Chilled	C*	Battle	Yellow	JEP05
FB07-103_JEP05	Krillin	R*	Battle	Black	JEP05
FB07-116_JEP05	Vegeta	C*	Battle	Black	JEP05
`;

content = content.replace('\`;', cardsToAdd + '\n\`;');
fs.writeFileSync(file, content);
console.log('Added cards to fusion_world.ts');
