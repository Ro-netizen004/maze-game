const palettes = ['#e9b85b', '#74d4ca', '#f18b9d', '#b8a0ef', '#9aca6b', '#7db6eb']
const symbols = ['sun', 'eye', 'diamond', 'moon', 'star', 'mountain']
const definitions = {
  Stonegate: [
    ['ENTRANCE POST', [1, 1]], ['RUBY SEAL TURN', [3, 3]], ['SAPPHIRE PATH', [5, 1]],
    ['SHELTER BEND', [7, 3]], ['OLD ROAD GATE', [7, 7]],
  ],
  'Amber Halls': [
    ['ENTRANCE POST', [1, 1]], ['KEEPER’S SHELTER', [3, 1]], ['SAPPHIRE PATH', [5, 3]],
    ['SHELTER BEND', [7, 5]], ['OLD ROAD GATE', [9, 9]],
  ],
  'Twilight Labyrinth': [
    ['ENTRANCE POST', [1, 1]], ['RUBY SEAL TURN', [3, 1]], ['SAPPHIRE PATH', [5, 5]],
    ['WESTERN TURN', [9, 1]], ['RITUAL PASSAGE', [7, 7]], ['OLD ROAD GATE', [11, 11]],
  ],
}

// Mount each plaque on a neighboring wall, facing its walkable landmark cell.
export function getLandmarks(level) {
  const landmarks=definitions[level.layoutName||level.name].map(([name, [row, column]], index) => {
    const r=row+(level.mapOffset||0), c=column+(level.mapOffset||0)
    const direction = [[-1, 0], [0, 1], [1, 0], [0, -1]].find(([dr, dc]) => level.grid[r + dr]?.[c + dc] === 1)
    if (!direction) throw new Error(`No wall for landmark ${name}`)
    const [dr, dc] = direction
    return { name, cell: [r, c], wallCell: [r + dr, c + dc], normal: [-dc, -dr], color: palettes[index], symbol: symbols[index], number: index + 1 }
  })
  for(const clearing of level.clearings||[]) {
    const dr=Math.sign(clearing.cell[0]-clearing.entrance[0]),dc=Math.sign(clearing.cell[1]-clearing.entrance[1])
    landmarks.push({name:clearing.placeName.toUpperCase(),cell:clearing.cell,
      wallCell:[clearing.cell[0]+dr*2,clearing.cell[1]+dc*2],normal:[-dc,-dr],
      color:clearing.color,symbol:clearing.id==='dawn'?'sun':clearing.id==='moon'?'moon':'eye',number:landmarks.length+1,
    })
  }
  return landmarks
}
