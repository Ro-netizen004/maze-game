export const forestJournals = [
  { id: 'arrival', name: 'The Arrival', subtitle: 'Journal I · The keeper’s first night', cell: [3, 5], color: '#e9b85b',
    text: 'The Crown camp was empty when I arrived. Five travelers had vanished, but their lanterns were still warm. I took the keeper’s watch and marked the clearings with signs. There are no walls here, no locked paths. Only trees, mist, and the feeling that someone is walking when I stop. I left my next record where the owl sign overlooks the northeastern grove. If you find these books, take all five to the old road. Someone should know what happened here.',
    hint: 'From Crown Camp, head east and slightly south to Owl Watch in the northeastern grove. Look for another book on a stump beneath the eye sign. Use the open clearings to move around the guardian.' },
  { id: 'footsteps', name: 'Borrowed Footsteps', subtitle: 'Journal II · Something learns to listen', cell: [7, 17], color: '#74d4ca',
    text: 'The watcher has learned my footsteps. When I ran, it ran toward the sound. When I stopped behind the trees, it searched the place where I had been. It cannot see through the thick groves, but it remembers. I no longer mistake its silence for safety. I carried the third book south, to the hollow under the moon sign. The shelter nearby is large enough for one person. I hope it is still large enough for me.',
    hint: 'Head south from Owl Watch, keeping to the eastern side of the forest, until you find Moon Hollow. Sprinting is louder than walking. Break sight behind a grove, then use E at a shelter to hide.' },
  { id: 'reflection', name: 'The Moon’s Reflection', subtitle: 'Journal III · The forest keeps its promises', cell: [15, 19], color: '#b8a0ef',
    text: 'In the hollow I saw the keeper reflected in a puddle. He was standing behind me. When I turned, the clearing was empty. The oath was simple: remain until every traveler has found the road. I understand now why the watcher never leaves. It is what remains of the last keeper, still counting people who will never return. I moved the fourth record southwest, beneath the fallen arch. Its star sign is easier to see than its broken stones.',
    hint: 'Cross the open southern forest toward Fallen Arch in the southwest. Its sign bears a star. Save your flashlight battery by switching it off with F when you can see; it recharges while off.' },
  { id: 'oath', name: 'The Broken Oath', subtitle: 'Journal IV · Five names, five records', cell: [19, 7], color: '#9aca6b',
    text: 'I wrote down the five names, one in each record, and the road began to show through the mist. The forest does not need another keeper. It needs a witness. Do not burn the books or leave one behind. Together they are proof that the missing were here, and that the oath has been fulfilled. My final record is north of this arch, near the western edge, at the diamond sign I called Last Watch. I cannot carry it there myself.',
    hint: 'Go north and slightly west from Fallen Arch to Last Watch on the western side of the forest. Collect the final book beneath the diamond sign. You can discover the journals in any order.' },
  { id: 'departure', name: 'The Last Watch', subtitle: 'Journal V · A witness can leave', cell: [12, 4], color: '#f18b9d',
    text: 'If you are reading this, I am no longer keeping watch. The creature may still patrol, but the promise belongs to the books now. Take every record to the road in the southeast, beneath the mountain sign. The lantern there will remember you. Do not wait for a gate to open; there was never a gate. There was only the belief that we could not leave. Carry the truth past the treeline. Listen for the birds.',
    hint: 'Recover all five journals and activate all five ritual circles beside their sites. Then head southeast to Old Road, marked by a mountain sign and a tall lantern. Walk into the glowing clearing to escape. Use J or the archive button to reread any recovered clue.' },
]
export function journalCollection(level, collectedKeys = [], collectedClues = []) {
  const collected = new Set([...collectedKeys, ...collectedClues])
  return [...level.keys, ...(level.clues || [])].filter(item => collected.has(item.id))
}
export function canEscapeForest(level, collectedClues, activatedRituals = []) {
  return level.mechanics.requiredClues.every(id => collectedClues.includes(id))
    && (level.mechanics.requiredRituals || []).every(id => activatedRituals.includes(id))
}
