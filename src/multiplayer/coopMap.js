import { seededRandom } from '../levelRuntime.js'
import { addHedgeHiding } from '../hedgeHiding.js'

// One fixed shared layout. Room seeds never change the routes or ritual sites.
const size = 41
const grid = Array.from({length:size},()=>Array(size).fill(1))
const random = seededRandom('keepers-wilderness-v1')
const stack = [[1,1]]
grid[1][1]=0
while(stack.length) {
  const [r,c]=stack.at(-1)
  const choices=[[-2,0],[2,0],[0,-2],[0,2]].filter(([dr,dc])=>r+dr>0&&r+dr<size-1&&c+dc>0&&c+dc<size-1&&grid[r+dr][c+dc])
  if(!choices.length){stack.pop();continue}
  const [dr,dc]=choices[Math.floor(random()*choices.length)]
  grid[r+dr/2][c+dc/2]=grid[r+dr][c+dc]=0
  stack.push([r+dr,c+dc])
}
// Braid a subset of walls into escape loops, retaining the remaining dead ends.
for(let r=2;r<size-2;r++)for(let c=2;c<size-2;c++) {
  if(grid[r][c]&&random()<0.14&&((!grid[r-1][c]&&!grid[r+1][c]&&grid[r][c-1]&&grid[r][c+1])||(!grid[r][c-1]&&!grid[r][c+1]&&grid[r-1][c]&&grid[r+1][c])))grid[r][c]=0
}
const rituals=[
  ['dawn','Dawn','Sunwell Clearing',[7,7],'#ffc96b'],
  ['moon','Moon','Moonwell Clearing',[7,33],'#91c8ff'],
  ['watch','Watcher','The Watcher’s Court',[33,33],'#bb9aff'],
  ['eclipse','Eclipse','Eclipse Hollow',[33,7],'#ff8d99'],
]
const clearings=rituals.map(([id,name,placeName,cell,color],index)=>({id,name,placeName,cell,color,
  type:'rune',radius:4.5,entrance:[cell[0]+3,cell[1]],requiresShrines:rituals.slice(0,index).map(r=>r[0]),requiresDoors:[]}))
for(const {cell:[r,c]} of clearings)for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++)grid[r+dr][c+dc]=0
// A safe forecourt has an immediate, clearly marked leaf shelter.
grid[0][1]=0
grid[39][39]=grid[40][39]=0
const base={id:'keepers-wilderness',name:'The Keeper’s Wilderness',layoutName:'Cooperative Wilderness',coop:true,
  color:'#526b58',theme:'temple',grid,start:[1,1],end:[40,39],monster:clearings.map(s=>s.cell),
  keys:[],keySpawnPools:{},doors:[{id:'exit',name:'Old Road',cell:[40,39],axis:'z',offset:-0.7,color:'#ffd75b'}],
  shrines:clearings,clearings,hidingSpots:[],traps:[],noisyZones:[],mapOffset:0,
  mechanics:{requiredDoors:[],requiredShrines:rituals.map(r=>r[0]),sprintDrain:36,staminaRegen:16,shrineVisibilityBoost:1}}
const sheltered=addHedgeHiding(base)
const reserved=new Set([...clearings.flatMap(({cell:[r,c]})=>Array.from({length:49},(_,i)=>[r-3+Math.floor(i/7),c-3+i%7].join(','))),
  ...sheltered.hidingSpots.map(s=>s.cell.join(',')),base.start.join(','),base.end.join(',')])
const models=['sun-ember','moon-tear','watcher-eye','ritual-candle']
const names=[['Sun Ember','Dawn Dew','Golden Eye','Dawn Candle'],['Silver Ember','Moon Tear','Lunar Eye','Moon Candle'],
  ['Watcher Ember','Watcher’s Draught','Watcher’s Eye','Watcher Candle'],['Eclipse Ember','Nightfall Tears','Eclipse Eye','Eclipse Candle']]
const offerings=clearings.flatMap((shrine,index)=>models.map((model,slot)=>{
  // Spread each batch across all four quarters, never beside its destination.
  const quadrant=(index+slot+1)%4
  const target=clearings[quadrant].cell
  const candidates=[]
  for(let r=2;r<size-2;r++)for(let c=2;c<size-2;c++)if(!sheltered.grid[r][c]&&!reserved.has(`${r},${c}`)
    &&Math.abs(r-shrine.cell[0])+Math.abs(c-shrine.cell[1])>15)candidates.push([r,c])
  candidates.sort((a,b)=>(Math.abs(a[0]-target[0])+Math.abs(a[1]-target[1]))-(Math.abs(b[0]-target[0])+Math.abs(b[1]-target[1])))
  const cell=candidates[slot*3]||candidates[0]
  reserved.add(cell.join(','))
  const emberModels=['sun-ember','silver-ember','watcher-ember','eclipse-ember']
  return {id:`${shrine.id}-${slot}`,name:names[index][slot],model:slot===0?emberModels[index]:index===0&&slot===2?'golden-eye':model,
    liquidColor:slot===1?['#ffc65c','#79baff','#78e6a0','#bb7aff'][index]:undefined,rune:shrine.id,color:shrine.color,cell,
    requiresShrines:shrine.requiresShrines,requiresDoors:[],hint:`${['northwest','northeast','southeast','southwest'][quadrant]} trails`,rotation:0}
}))
export const coopMap={...sheltered,originalGrid:sheltered.grid,offerings,
  shrines:clearings.map(s=>({...s,requiresOfferings:offerings.filter(o=>o.rune===s.id).map(o=>o.id)}))}
