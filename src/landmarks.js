const palettes = ['#e9b85b', '#74d4ca', '#f18b9d', '#b8a0ef', '#9aca6b', '#7db6eb']
const symbols = ['sun', 'eye', 'diamond', 'moon', 'star', 'mountain']
const definitions = {
  Stonegate: [
    ['CROWN GATE', [1, 1]], ['OWL WATCH', [3, 3]], ['ROSE COURT', [5, 1]],
    ['MOON TURN', [7, 3]], ['LAST BASTION', [7, 7]],
  ],
  'Amber Halls': [
    ['SUN PORCH', [1, 1]], ['OWL CORNER', [3, 1]], ['COPPER MILL', [5, 3]],
    ['DUSK HALL', [7, 5]], ['OAK GATE', [9, 9]],
  ],
  'Twilight Labyrinth': [
    ['DAWN SHRINE', [1, 1]], ['WATCHER', [3, 1]], ['CRYSTAL WELL', [5, 5]],
    ['MOON CHAMBER', [9, 1]], ['STAR WALK', [7, 7]], ['FINAL SPIRE', [11, 11]],
  ],
}

// Mount each plaque on a neighboring wall, facing its walkable landmark cell.
export function getLandmarks(level) {
  return definitions[level.name].map(([name, [row, column]], index) => {
    const r=row+(level.mapOffset||0), c=column+(level.mapOffset||0)
    const direction = [[-1, 0], [0, 1], [1, 0], [0, -1]].find(([dr, dc]) => level.grid[r + dr]?.[c + dc] === 1)
    if (!direction) throw new Error(`No wall for landmark ${name}`)
    const [dr, dc] = direction
    return { name, cell: [r, c], wallCell: [r + dr, c + dc], normal: [-dc, -dr], color: palettes[index], symbol: symbols[index], number: index + 1 }
  })
}
