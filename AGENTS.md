# Agent Rules & Guardrails

## STRICT RULE: PROTECT THE CARD CATALOG / DATA FILES
- **DO NOT add, delete, rename, or modify any cards in the `src/data/` files (such as `bt1.ts` through `bt30.ts`, `promos.ts`, expansions, etc.) under any circumstances unless explicitly, unambiguously instructed by the user in the current message.**
- Adhere strictly to the rule: "No card modifications without explicit command".
- If a data extraction or auto-scraping task is requested, **ONLY** update details or existing cards if specified, but **NEVER** modify, delete, or clean up any other existing cards (such as Judge Packs `_JP01`, `_JP02`, `_JP03`, `_JP04`, promo cards, etc.).
- Treat the current catalog as holy and write-protected by default.

## UI/UX Guidelines
- Keep Multi-Select/Bulk updates reliable and robust.
- Standard buttons in the multiselect drawer for marking/unmarking card status must be labeled simply and legibly:
  - "MARCAR" (Spanish) or "MARK" (English) for marking/adding cards to collection goal.
  - "DESMARCAR" (Spanish) or "UNMARK" (English) for unmarking/removing cards from collection.
