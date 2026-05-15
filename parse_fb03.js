const fs = require('fs');

const raw = `FB01-016	Red	Son Gohan : Adolescence	BATTLE	R
FB01-049	Blue	Trunks : Future	BATTLE	R
FB03-001	Red	Jiren	LEADER	L
FB03-001	Red	Jiren	LEADER	L
FB03-002	Red	Kahseral	BATTLE	R
FB03-003	Red	Khai	BATTLE	C
FB03-004	Red	Cabba	BATTLE	R
FB03-005	Red	Kunshi	BATTLE	UC
FB03-006	Red	Kettol	BATTLE	C
FB03-007	Red	Kefla	BATTLE	C
FB03-008	Red	Cocotte	BATTLE	UC
FB03-009	Red	Jiren	BATTLE	SR
FB03-009	Red	Jiren	BATTLE	SR
FB03-010	Red	Zoiray	BATTLE	UC
FB03-011	Red	Son Goku	BATTLE	UC
FB03-012	Red	Tupper	BATTLE	C
FB03-013	Red	Dyspo	BATTLE	C
FB03-014	Red	Dyspo	BATTLE	R
FB03-015	Red	Toppo	BATTLE	C
FB03-016	Red	Toppo	BATTLE	SR
FB03-016	Red	Toppo	BATTLE	SR
FB03-017	Red	Hit	BATTLE	UC
FB03-018	Red	Beerus	BATTLE	R
FB03-019	Red	Vuon	BATTLE	UC
FB03-020	Red	Vegeta	BATTLE	SR
FB03-020	Red	Vegeta	BATTLE	SR
FB03-021	Red	Belmod	BATTLE	UC
FB03-022	Red	Marcarita	BATTLE	C
FB03-023	Red	It's Over!	EXTRA	R
FB03-024	Red	The Greatest Showdown of All Time!	EXTRA	UC
FB03-025	Red	Double Cannon Maximum	EXTRA	C
FB03-026	Red	Sphere of Destruction	EXTRA	C
FB03-027	Blue	Son Goku	LEADER	L
FB03-027	Blue	Son Goku	LEADER	L
FB03-028	Blue	Erasa	BATTLE	C
FB03-029	Blue	Whis	BATTLE	UC
FB03-030	Blue	Kibito	BATTLE	C
FB03-031	Blue	Krillin	BATTLE	C
FB03-032	Blue	Great Saiyaman	BATTLE	C
FB03-033	Blue	Sharpner	BATTLE	UC
FB03-034	Blue	Shin	BATTLE	C
FB03-035	Blue	Android 18	BATTLE	UC
FB03-036	Blue	Son Goku	BATTLE	UC
FB03-037	Blue	Son Goten	BATTLE	R
FB03-038	Blue	Son Gohan : Adolescence	BATTLE	C
FB03-039	Blue	Son Gohan : Adolescence	BATTLE	SR
FB03-039	Blue	Son Gohan : Adolescence	BATTLE	SR
FB03-040	Blue	Trunks : Future	BATTLE	R
FB03-041	Blue	Trunks : Youth	BATTLE	C
FB03-042	Blue	Videl	BATTLE	SR
FB03-042	Blue	Videl	BATTLE	SR
FB03-043	Blue	Videl	BATTLE	C
FB03-044	Blue	Piccolo	BATTLE	C
FB03-045	Blue	Beerus	BATTLE	R
FB03-046	Blue	Bulma	BATTLE	UC
FB03-047	Blue	Vegeta	BATTLE	R
FB03-048	Blue	Mighty Mask	BATTLE	UC
FB03-049	Blue	Hercule	BATTLE	R
FB03-050	Blue	Orange Star High School	EXTRA	R
FB03-051	Blue	Great Saiyaman!	EXTRA	C
FB03-052	Blue	You Prefer Girls With Short Hair?	EXTRA	UC
FB03-053	Green	Piccolo	LEADER	L
FB03-053	Green	Piccolo	LEADER	L
FB03-054	Green	King Yemma	BATTLE	C
FB03-055	Green	Kami	BATTLE	C
FB03-056	Green	Master Roshi	BATTLE	UC
FB03-057	Green	North Kai	BATTLE	R
FB03-058	Green	Gregory	BATTLE	UC
FB03-059	Green	Android 17	BATTLE	R
FB03-060	Green	Cell	BATTLE	UC
FB03-061	Green	Cell	BATTLE	R
FB03-062	Green	The Farmer With Power Level 5	BATTLE	C
FB03-063	Green	Son Goku	BATTLE	C
FB03-064	Green	Son Goku	BATTLE	SR
FB03-064	Green	Son Goku	BATTLE	SR
FB03-065	Green	Son Gohan : Youth	BATTLE	C
FB03-066	Green	Son Gohan : Youth	BATTLE	UC
FB03-067	Green	Nappa	BATTLE	C
FB03-068	Green	Bubbles	BATTLE	UC
FB03-069	Green	Piccolo	BATTLE	C
FB03-070	Green	Piccolo	BATTLE	SR
FB03-070	Green	Piccolo	BATTLE	SR
FB03-071	Green	Bulma	BATTLE	C
FB03-072	Green	Vegeta	BATTLE	C
FB03-073	Green	Raditz	BATTLE	UC
FB03-074	Green	Raditz	BATTLE	R
FB03-075	Green	Days of Training	EXTRA	UC
FB03-076	Green	Scouter	EXTRA	C
FB03-077	Green	Special Beam Cannon	EXTRA	R
FB03-078	Yellow	Babidi	LEADER	L
FB03-078	Yellow	Babidi	LEADER	L
FB03-079	Yellow	Spopovich	BATTLE	C
FB03-080	Yellow	Son Goku	BATTLE	R
FB03-081	Yellow	Dabura	BATTLE	UC
FB03-082	Yellow	Dabura	BATTLE	UC
FB03-083	Yellow	Babidi	BATTLE	R
FB03-084	Yellow	Babidi	BATTLE	C
FB03-085	Yellow	Bibidi	BATTLE	UC
FB03-086	Yellow	Pui Pui	BATTLE	R
FB03-087	Yellow	Bulma	BATTLE	UC
FB03-088	Yellow	Vegeta	BATTLE	C
FB03-089	Yellow	Vegeta	BATTLE	SR
FB03-089	Yellow	Vegeta	BATTLE	SR
FB03-090	Yellow	Vegeta	BATTLE	C
FB03-091	Yellow	Majin Buu : Pure Evil	BATTLE	UC
FB03-092	Yellow	Majin Buu	BATTLE	C
FB03-093	Yellow	Majin Buu	BATTLE	SR
FB03-093	Yellow	Majin Buu	BATTLE	SR
FB03-094	Yellow	Meta-Cooler Core	BATTLE	R
FB03-095	Yellow	Yakon	BATTLE	UC
FB03-096	Yellow	Yamu	BATTLE	C
FB03-097	Yellow	Recoome	BATTLE	UC
FB03-098	Yellow	Turn Into Candy!	EXTRA	C
FB03-099	Yellow	Energy Absorption	EXTRA	C
FB03-100	Yellow	Paparapaa!	EXTRA	C
FB03-101	Yellow	Babidi's Spaceship	EXTRA	R
FB03-102	Yellow	Final Explosion	EXTRA	R
FB03-103	Yellow	Sealed Majin	EXTRA	C
FB03-104	Black	Son Goku : GT	LEADER	L
FB03-104	Black	Son Goku : GT	LEADER	L
FB03-105	Black	Uub : GT	BATTLE	R
FB03-106	Black	Golden Great Ape Son Goku	BATTLE	C
FB03-107	Black	Gine : BR	BATTLE	UC
FB03-108	Black	Giru	BATTLE	C
FB03-109	Black	Zoonama	BATTLE	C
FB03-110	Black	Son Goku : GT	BATTLE	R
FB03-111	Black	Son Goku : GT	BATTLE	SR
FB03-111	Black	Son Goku : GT	BATTLE	SR
FB03-112	Black	Son Goku : Childhood BR	BATTLE	C
FB03-113	Black	Son Goten : GT	BATTLE	UC
FB03-114	Black	Son Gohan : GT	BATTLE	R
FB03-115	Black	Chilled	BATTLE	UC
FB03-116	Black	Toolo	BATTLE	UC
FB03-117	Black	Dr. Myuu	BATTLE	C
FB03-118	Black	Trunks : GT	BATTLE	UC
FB03-119	Black	Trunks : GT	BATTLE	R
FB03-120	Black	Dolltucky	BATTLE	UC
FB03-121	Black	Bardock	BATTLE	SR
FB03-121	Black	Bardock	BATTLE	SR
FB03-122	Black	Bardock : BR	BATTLE	UC
FB03-123	Black	Para Para Brothers	BATTLE	UC
FB03-124	Black	Pan : GT	BATTLE	C
FB03-125	Black	Pan : GT	BATTLE	SR
FB03-125	Black	Pan : GT	BATTLE	SR
FB03-126	Black	Piccolo : GT	BATTLE	C
FB03-127	Black	Bulla : GT	BATTLE	UC
FB03-128	Black	Bulma : GT	BATTLE	R
FB03-129	Black	Vegeta : GT	BATTLE	C
FB03-130	Black	Vegeta : Childhood BR	BATTLE	C
FB03-131	Black	Majin Buu : GT	BATTLE	C
FB03-132	Black	Hercule : GT	BATTLE	R
FB03-133	Black	Luud	BATTLE	C
FB03-134	Black	Ledgic	BATTLE	R
FB03-135	Black	New Legend	EXTRA	UC
FB03-136	Black	Spaceship of Hope	EXTRA	C
FB03-137	Black	10x Kamehameha	EXTRA	R
FB03-138	Black	Great Ape Who Gained Intelligence	EXTRA	C
FB03-139	Green	Son Gohan : Youth	BATTLE	SCR
FB03-139	Green	Son Gohan : Youth	BATTLE	SCR
FB03-140	Black	Son Goku : GT	BATTLE	SCR
FB03-140	Black	Son Goku : GT	BATTLE	SCR
FB03-140	Black	Son Goku : GT	BATTLE	SCR
FS04-09	Yellow	Cheelai : BR	BATTLE	C`;

const lines = raw.split("\n").filter(l => l.trim().length > 0);
let result = "";
const seenCards = new Map();

for (const line of lines) {
  const parts = line.split("\t");
  if (parts.length < 5) continue;
  let [card_id, color, name, type, rarity] = parts;
  
  if (type.toLowerCase() === 'battle') type = 'Battle';
  else if (type.toLowerCase() === 'extra') type = 'Extra';
  else if (type.toLowerCase() === 'leader') type = 'Leader';

  let key = `${card_id}`;
  let isPromoOrNonFB = false;

  if (!card_id.startsWith("FB03")) {
    isPromoOrNonFB = true;
  }

  if (seenCards.has(key)) {
    let altCount = seenCards.get(key) + 1;
    seenCards.set(key, altCount);
    
    let star = "*";
    if (altCount === 2) star = "**";

    let altId = `${card_id}_A`;
    if (altCount > 1) {
        if (altCount === 2) altId = `${card_id}_AA`;
    }

    if (isPromoOrNonFB) {
        altId = `${card_id}_A_FB03`;
    }

    result += `${altId}\t${name} (Alt)\t${rarity}${star}\t${type}\t${color}\tFB03\n`;
  } else {
    seenCards.set(key, 0);
    if (isPromoOrNonFB) {
        result += `${card_id}_A_FB03\t${name} (Alt)\t${rarity}*\t${type}\t${color}\tFB03\n`;
    } else {
        result += `${card_id}\t${name}\t${rarity}\t${type}\t${color}\tFB03\n`;
    }
  }
}

fs.writeFileSync('out.txt', result);
console.log('done');
