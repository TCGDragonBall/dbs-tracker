const fs = require('fs');
const path = 'src/TrackerApp.tsx';
let content = fs.readFileSync(path, 'utf-8');

const target = `              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full">`;

const replacement = `              </div>

              {commonVariants.length > 1 && (
                <div className="flex items-center gap-2 px-2 overflow-x-auto custom-scrollbar no-scrollbar">
                  {commonVariants.map(variant => (
                    <button
                      key={variant.en}
                      onClick={() => setBulkVariantLabelEn(variant.en)}
                      className={\`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider transition-colors \${
                        bulkVariantLabelEn === variant.en 
                          ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]' 
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }\`}
                    >
                      {lang === 'es' ? variant.es : variant.en}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 sm:gap-3 w-full">`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(path, content, 'utf-8');
  console.log('UI patch successful');
} else {
  console.log('UI target not found');
}
