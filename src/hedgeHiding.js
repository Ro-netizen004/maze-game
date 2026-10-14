const directions = [[-1,0],[1,0],[0,-1],[0,1]]

// Only carve leaf pockets: never join corridors or create a route around a gate.
export function addHedgeHiding(level) {
  const grid = level.grid.map(row => [...row])
  const [startRow,startColumn]=level.start
  const beginning={id:'entrance-hide',type:'shrub',cell:[startRow-1,startColumn-1],entryCell:[startRow-1,startColumn]}
  const candidates = []
  for (let r=1;r<grid.length-1;r++) for(let c=1;c<grid[r].length-1;c++) {
    if(grid[r][c]!==1) continue
    if(Math.abs(beginning.cell[0]-r)+Math.abs(beginning.cell[1]-c)<=1) continue
    const adjacent=directions.map(([dr,dc])=>[r+dr,c+dc]).filter(([rr,cc])=>grid[rr][cc]===0)
    if(adjacent.length!==1) continue
    if(level.doors.some(({cell})=>Math.abs(cell[0]-r)+Math.abs(cell[1]-c)<=2)) continue
    if(level.clearings.some(({cell})=>Math.hypot(cell[0]-r,cell[1]-c)<3)) continue
    // Separate candidate pockets so two selected recesses cannot merge.
    if(candidates.some(({cell})=>Math.abs(cell[0]-r)+Math.abs(cell[1]-c)<=1)) continue
    candidates.push({id:`hedge-${r}-${c}`,type:'shrub',cell:[r,c],entryCell:adjacent[0]})
  }
  const count=Math.round(candidates.length*0.3)
  const pockets=Array.from({length:count},(_,i)=>candidates[Math.floor((i+0.5)*candidates.length/count)])
  // Guarantee a shelter beside the first outside step on every maze. The
  // padded entrance is isolated, so this remains a leaf pocket, never a bypass.
  if(grid[beginning.entryCell[0]]?.[beginning.entryCell[1]]===0 && grid[beginning.cell[0]]?.[beginning.cell[1]]===1) {
    pockets.push(beginning)
  }
  pockets.forEach(({cell:[r,c]})=>{grid[r][c]=0})
  return {...level,grid,hedgeGapCount:candidates.length,entranceHidingSpot:beginning,hedgePockets:pockets,hidingSpots:[...level.hidingSpots,...pockets]}
}
