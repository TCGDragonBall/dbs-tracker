# Agent Rules & Guardrails

## STRICT RULE: PROTECT THE CARD CATALOG / DATA FILES
- **DO NOT add, delete, rename, or modify any cards in the `src/data/` files (such as `bt1.ts` through `bt30.ts`, `promos.ts`, expansions, etc.) under any circumstances unless explicitly, unambiguously instructed by the user in the current message.**
- Adhere strictly to the rule: "No card modifications without explicit command".
- If a data extraction or auto-scraping task is requested, **ONLY** update details or existing cards if specified, but **NEVER** modify, delete, or clean up any other existing cards (such as Judge Packs `_JP01`, `_JP02`, `_JP03`, `_JP04`, promo cards, etc.).
- Treat the current catalog as holy and write-protected by default.
- **Card Variants**: When extracting data for new card versions (e.g., Judge Packs, alt-arts like `_JP05_L2`, promos), clone the base card's details and stats that already exist in the file. No need to add new base cards if they exist; just clone the info with the proper ID suffix.

## URL & Image Handling
- Images are sourced from `dragonball.center` by default.
- If a relative URL is provided (e.g., `/files/module_dbc/objetos/...`), it MUST be correctly concatenated to form the absolute URL: `https://dragonball.center/files/module_dbc/objetos/...` (ensure no double slashes).
- **Auto-Registration**: Any provided Set, Folder, Sealed product, subcategory, or card image URL MUST be automatically stored and listed in the global images constants within `src/TrackerApp.tsx`, and associated under the corresponding Set/Folder without needing explicit commands every time.

## UI/UX Guidelines & Interface Structure
- Keep Multi-Select/Bulk updates reliable and robust.
- Standard buttons in the multiselect drawer for marking/unmarking card status must be labeled simply and legibly:
  - "MARCAR" (Spanish) or "MARK" (English) for marking/adding cards to collection goal.
  - "DESMARCAR" (Spanish) or "UNMARK" (English) for unmarking/removing cards from collection.
- Consistently update grouping Arrays (e.g., `const JUDGE_PACK_05_L2 = [...]`, `const POWER_BOOSTER_01 = [...]`) in `TrackerApp.tsx` and ensure they are referenced in the general mapping.
- Categories must be correctly listed in the side navigation panel menu, respecting the existing format and ensuring folders have the necessary properties (ID, label, sub, and subItems where applicable).
