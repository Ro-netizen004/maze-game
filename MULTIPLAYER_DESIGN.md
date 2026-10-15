# Cooperative objective proposal

Solo and an initial networked co-op mode are implemented. See MULTIPLAYER_SETUP.md
for private/public rooms, server setup, shared rituals, revives and group escape.
The following are ideas for later quest extensions, rather than all implemented features.

Keep one connected escape chain: clues identify keys/seals; seals awaken the ritual sites; the ritual releases the exit; the group evacuates.

- **Shared clue discovery:** split journal fragments or symbols across routes. Players communicate their findings to identify the correct seal or rune sequence. Make discoveries available in a shared record so a disconnected player cannot strand the run.
- **Paired mechanisms:** one player holds a lever while another crosses a gate or retrieves a ritual item. A shortcut opened afterward lets the helper rejoin the group. Scale required stations to the active group size.
- **Ritual preparation and channeling:** collect components, determine the order from clues, then coordinate the final activation. Some players channel while others draw the guardian away. Ritual progress creates the next objective; it is not a separate checklist.
- **Group evacuation and rescue:** once the exit opens, return together, help a caught teammate, and reach the exit zone. Use a recoverable caught state rather than eliminating a player early and leaving them waiting.

For an initial cooperative version, start with shared clues, one paired seal mechanism, and one final ritual. Avoid permanent classes or a large collection of unrelated chores. Define group-size scaling and recovery from disconnects before implementing the networked game.
