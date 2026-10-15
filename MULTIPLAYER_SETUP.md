# Multiplayer setup

The game offers Solo and 2–4 player co-op. Co-op supports private invite-code
rooms, a public room browser and quick join (which creates a public room when
none matches the selected maze and difficulty).

## Run locally

Use Node.js 24. In separate terminals:

```sh
npm ci
npm run server
```

```sh
npm run dev -- --host 0.0.0.0
```

Open the Vite URL in two browsers/tabs. Select Multiplayer, connect to
`ws://127.0.0.1:8787`, and create/join a room. Only the host can start, and at
least two players must join. Friends on the same LAN use your computer's LAN
address in both the website URL and `ws://LAN-IP:8787`.

## Connect the GitHub Pages site

GitHub Pages hosts the game files; it cannot run this WebSocket server.

1. Deploy this repository as a Node.js web service, with build command `npm ci`
   and start command `npm run server`, or use the included Dockerfile.
2. The service must support WebSocket upgrades. Its HTTPS proxy supplies TLS;
   clients connect using the corresponding `wss://your-service-host` address.
3. Set the server's `ALLOWED_ORIGINS` to
   `https://ro-netizen004.github.io` (add other website origins separated by commas).
   Set `PORT` if the host requires one; otherwise it defaults to 8787.
4. Check `https://your-service-host/health`; it returns `{"ok":true,...}`.
5. Enter the `wss://` URL in the game's Multiplayer server field. To prefill it
   for all players, add a GitHub Actions repository variable named
   `VITE_MULTIPLAYER_URL` with that URL and rebuild/deploy the website.

The server has no database or account requirement. Rooms exist in memory and
are cleared when the server restarts. Use one running server instance; multiple
independent replicas do not share rooms. Disconnected players leave the room,
and remaining players keep quest progress. Rejoin a fresh lobby after a dropped
connection; active runs do not accept new players.

## Co-op rules

- The server owns the maze seed, quest progress, guardian, timer and blackout.
  Player movement is bounded and collision-checked; interactions require nearby
  players and valid prerequisites. Clients cannot submit arbitrary quest state.
- Keys and relics enter a shared team inventory. Either player can deliver them.
  The existing six-relic ritual sequence and deposited models apply to co-op.
- Caught players stay in the world and can be revived by a nearby teammate with
  E / Use. Revived players have five seconds of catch immunity to get away.
- Everyone still connected must reach the open exit. If every remaining explorer
  is caught and nobody can rescue them, the run ends. The host returns the group
  to a fresh lobby after a result. Host ownership transfers on disconnect.
- Opening the pause menu stops your input but does not pause the shared world.
  Multiplayer results do not overwrite Solo best times or unlocks.
- No voice/text chat or accounts are included in this first version.

## Verification

`npm test` includes room/quest/revive/escape tests and a real two-client WebSocket
test using an ephemeral local port. The tests require local network permission.
`npm run lint` and `npm run build` also validate the server imports and client.

The server uses the [ws WebSocket library](https://github.com/websockets/ws);
the browser uses its native WebSocket API.
