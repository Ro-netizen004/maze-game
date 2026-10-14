import { cellSize, doorBounds } from './levels.js'
import { getLockedDoors } from './levelRuntime.js'

export const playerRadius = 0.3
const obstacleCache = new WeakMap()

// Resolve a small movement step by pushing the circle out along wall normals.
// Unlike rejecting X and Z separately, this also slides around rounded corners.
export function movePlayer(level, x, z, dx, dz, openedDoors = null, radius = playerRadius) {
  const width = level.grid[0].length * cellSize
  const depth = level.grid.length * cellSize
  let cache=obstacleCache.get(level)
  if(!cache){cache=new Map();obstacleCache.set(level,cache)}
  const signature=openedDoors===null?'walls':'doors:'+openedDoors.slice().sort().join(',')
  let obstacles=cache.get(signature)
  if(!obstacles){
  obstacles = []
  const opened = new Set(openedDoors || [])
  const openDoorCells = new Set((level.doors || []).filter(door => opened.has(door.id)).map(door => door.cell.join(',')))
  level.grid.forEach((row, r) => row.forEach((cell, c) => {
    if (!cell || openDoorCells.has(`${r},${c}`)) return
    const left = c * cellSize - width / 2
    const front = r * cellSize - depth / 2
    obstacles.push({ left, right: left + cellSize, front, back: front + cellSize })
  }))
  if (openedDoors !== null) {
    for (const door of getLockedDoors(level, openedDoors)) obstacles.push(doorBounds(level, door))
  }
  cache.set(signature,obstacles)
  }
  x += dx
  z += dz
  for (let pass = 0; pass < 6; pass++) {
    x = Math.max(-width / 2 + radius, Math.min(width / 2 - radius, x))
    z = Math.max(-depth / 2 + radius, Math.min(depth / 2 - radius, z))
    let corrected = false
    obstacles.forEach(({ left, right, front, back }) => {
      if(x+radius<left || x-radius>right || z+radius<front || z-radius>back)return
      const nearestX = Math.max(left, Math.min(x, right))
      const nearestZ = Math.max(front, Math.min(z, back))
      const nx = x - nearestX
      const nz = z - nearestZ
      const distance = Math.hypot(nx, nz)
      if (distance >= radius) return
      corrected = true
      if (distance > 0.000001) {
        const push = radius - distance + 0.00001
        x += nx / distance * push
        z += nz / distance * push
      } else {
        // Defensive recovery if a spawn or edit places the center inside a wall.
        const faces = [
          { distance: x - left, x: left - radius, z },
          { distance: right - x, x: right + radius, z },
          { distance: z - front, x, z: front - radius },
          { distance: back - z, x, z: back + radius },
        ].sort((a, b) => a.distance - b.distance)
        x = faces[0].x
        z = faces[0].z
      }
    })
    if (!corrected) break
  }
  return [x, z]
}
