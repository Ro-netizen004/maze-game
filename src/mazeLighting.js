const sides=[[0,-1],[0,1],[-1,0],[1,0]]
export function lightpostLayout(level,mobile=false) {
  const center=([r,c])=>[(c-(level.grid[0].length-1)/2)*2,(r-(level.grid.length-1)/2)*2]
  const fixtures=[]
  for(const clearing of level.clearings||[]){
    const [x,z]=center(clearing.cell)
    for(const side of mobile?[1]:[-1,1])fixtures.push({id:clearing.id+'-'+side,position:[x+side*1.85,0,z+1.4],garden:true,color:clearing.color})
  }
  // Mark the two new outer loops without increasing the active point-light cap.
  for(const route of (level.escapeRoutes||[]).filter(route=>route.id==='west-flank'||route.id==='moonwell-return')) {
    const [r,c]=route.cells[Math.floor(route.cells.length/2)]
    const side=sides.find(([dr,dc])=>level.grid[r+dr]?.[c+dc]===1)
    if(!side)continue
    const [x,z]=center([r,c])
    fixtures.push({id:`route-${route.id}`,position:[x+side[1]*0.73,0,z+side[0]*0.73],garden:false,route:route.id,cell:[r,c]})
  }
  const candidates=[], offset=level.mapOffset||0
  const original=level.originalGrid||level.grid
  for(let r=offset+1;r<offset+original.length-1;r++)for(let c=offset+1;c<offset+original[0].length-1;c++){
    if(level.grid[r][c] || level.doors.some(door=>door.cell[0]===r && door.cell[1]===c))continue
    const side=sides.find(([dr,dc])=>level.grid[r+dr]?.[c+dc]===1)
    if(!side)continue
    const [x,z]=center([r,c])
    candidates.push({id:`trail-${r}-${c}`,position:[x+side[1]*0.73,0,z+side[0]*0.73],garden:false,cell:[r,c]})
  }
  const desired=mobile?6:Math.min(12,original.length)
  for(let i=0;i<desired && candidates.length;i++){
    candidates.sort((a,b)=>distance(b)-distance(a))
    const next=candidates.shift()
    if(distance(next)<2.8)continue
    fixtures.push(next)
  }
  function distance(candidate){return fixtures.length?Math.min(...fixtures.map(f=>Math.hypot(candidate.position[0]-f.position[0],candidate.position[2]-f.position[2]))):Infinity}
  return fixtures
}
