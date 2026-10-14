const entrances = {
  Stonegate: [[1,1,'west'],[1,5,'north'],[3,7,'east']],
  'Amber Halls': [[3,1,'west'],[1,7,'north'],[7,9,'east']],
  'Twilight Labyrinth': [[5,1,'west'],[1,7,'north'],[7,11,'east']],
}

// Attach isolated gardens outside the old perimeter. Interior corridors and
// gates retain their geometry and world positions; each garden has one entrance.
export function addRuneClearings(level) {
  const padding=4, originalGrid=level.grid
  const rows=originalGrid.length, columns=originalGrid[0].length
  const shift=([r,c])=>[r+padding,c+padding]
  const grid=Array.from({length:rows+padding*2},()=>Array(columns+padding*2).fill(1))
  originalGrid.forEach((row,r)=>row.forEach((cell,c)=>{grid[r+padding][c+padding]=cell}))
  const clearings=entrances[level.name].map(([r,c,side],index)=>{
    const center=side==='west'?[r,-2]:side==='east'?[r,columns+1]:[-2,c]
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)grid[center[0]+dr+padding][center[1]+dc+padding]=0
    const [rr,cc]=center
    for(let row=Math.min(r,rr);row<=Math.max(r,rr);row++)for(let col=Math.min(c,cc);col<=Math.max(c,cc);col++)grid[row+padding][col+padding]=0
    return {id:['dawn','moon','watch'][index],name:['Dawn','Moon','Watcher'][index],cell:shift(center),entrance:shift([r,c]),radius:2.6,color:['#74d4ca','#b9a5ff','#e9b85b'][index]}
  })
  // Continue the existing start/end openings through the added perimeter.
  for(let r=0;r<padding;r++)grid[r][level.start[1]+padding]=0
  for(let r=rows+padding;r<grid.length;r++)grid[r][level.end[1]+padding]=0
  const move=item=>({...item,cell:shift(item.cell)})
  return {...level,grid,originalGrid,mapOffset:padding,clearings,
    start:shift(level.start),end:shift(level.end),monster:level.monster.map(shift),
    keys:level.keys.map(move),doors:level.doors.map(move),
    keySpawnPools:Object.fromEntries(Object.entries(level.keySpawnPools).map(([id,pool])=>[id,pool.map(shift)])),
    hidingSpots:level.hidingSpots.map(move),traps:level.traps.map(move),noisyZones:level.noisyZones.map(move),
    mechanics:{...level.mechanics,requiredShrines:['dawn','moon','watch']},
    shrines:clearings.map(clearing=>({...clearing,type:'rune',
      requiresDoors:clearing.id==='dawn'?['ruby']:clearing.id==='moon'?['sapphire']:[],
      requiresShrines:clearing.id==='watch'?['dawn','moon']:[],
    })),
  }
}
