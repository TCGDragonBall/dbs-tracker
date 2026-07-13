const fs = require('fs');
let code = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

code = code.replace(/src=\{profile\?\.photoURL \|\| user\?.photoURL \|\| undefined\}/g, "src={profile?.photoURL || user?.photoURL || null}");
code = code.replace(/src=\{selectedCard\.imageUrl \|\| undefined\}/g, "src={selectedCard?.imageUrl || null}");
code = code.replace(/src=\{selectedCard\.backImageUrl \|\| undefined\}/g, "src={selectedCard?.backImageUrl || null}");
code = code.replace(/src=\{bgImage \|\| undefined\}/g, "src={bgImage || null}");
code = code.replace(/src=\{subBgImage \|\| undefined\}/g, "src={subBgImage || null}");
code = code.replace(/src=\{card\.imageUrl \|\| undefined\}/g, "src={card?.imageUrl || null}");
code = code.replace(/src=\{card\.img \|\| undefined\}/g, "src={card?.img || null}");
code = code.replace(/src=\{src\}/g, "src={src || null}");
code = code.replace(/src=\{name\}/g, "src={name || null}");
code = code.replace(/src=\{card\.imageUrl \|\| `https:\/\/picsum\.photos\/seed\/\$\{card\.id\}\/400\/600`\}/g, "src={card?.imageUrl || `https://picsum.photos/seed/${card?.id}/400/600`}");
code = code.replace(/src=\{profile\?\.photoURL \|\| user\?.photoURL \|\| `https:\/\/api\.dicebear\.com\/7\.x\/avataaars\/svg\?seed=\$\{user\?\.uid \|\| 'default'\}`\}/g, "src={profile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'default'}`}");

fs.writeFileSync('src/TrackerApp.tsx', code);
