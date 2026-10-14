// Tree barriers follow broken rings and hooked corridors from the supplied sketch.
// Coordinates are grid cells: row (south), column (east).
export function createForestLayout() {
  const grid = Array.from({ length: 25 }, () => Array(25).fill(0))
  const line = points => {
    for (let i = 1; i < points.length; i++) {
      const [ar, ac] = points[i - 1], [br, bc] = points[i]
      const steps = Math.max(Math.abs(br - ar), Math.abs(bc - ac)) * 4
      for (let t = 0; t <= steps; t++) grid[Math.round(ar + (br - ar) * t / steps)][Math.round(ac + (bc - ac) * t / steps)] = 1
    }
  }
  const ring = (r, c, radius, gaps) => {
    for (let i = 0; i < 360; i++) {
      if (gaps.some(([a, b]) => i >= a && i <= b)) continue
      const angle = i * Math.PI / 180
      grid[Math.round(r + Math.sin(angle) * radius)][Math.round(c + Math.cos(angle) * radius)] = 1
    }
  }
  ring(12, 12, 4, [[70, 110], [240, 280]])
  ring(12, 12, 6, [[0, 25], [155, 205], [335, 359]])
  ring(10, 3, 2, [[235, 305], [55, 125]])
  ring(4, 20, 2, [[65, 115], [245, 295]])
  line([[1, 7], [1, 10], [4, 10], [4, 9], [2, 9], [2, 7], [6, 7], [6, 5]])
  line([[2, 12], [2, 17], [5, 17], [5, 16], [3, 16], [3, 12], [6, 12]])
  line([[7, 1], [7, 6], [4, 6]])
  line([[15, 2], [15, 6], [18, 6], [18, 3], [20, 3], [20, 5]])
  line([[22, 2], [22, 9], [18, 9], [18, 8], [21, 8]])
  line([[22, 11], [22, 17], [19, 17], [19, 15]])
  line([[8, 21], [8, 23], [1, 23]])
  line([[10, 20], [10, 23], [15, 23], [15, 22], [12, 22], [12, 20], [19, 20], [19, 23]])
  line([[22, 19], [22, 23], [21, 23]])
  // Seal the perimeter; the southeast exit is a clearing inside this boundary.
  for (let i = 0; i < 25; i++) grid[0][i] = grid[24][i] = grid[i][0] = grid[i][24] = 1
  return grid
}

// Join disconnected clearings by removing the fewest tree cells. Outer rows stay
// sealed; this opens deliberate gaps rather than cutting straight objective paths.
export function connectForestClearings(grid, start) {
  const id = ([r, c]) => r * 25 + c
  for (;;) {
    const costs = new Map([[id(start), 0]]), parents = new Map(), queue = [start]
    while (queue.length) {
      queue.sort((a, b) => costs.get(id(b)) - costs.get(id(a)))
      const current = queue.pop(), [r, c] = current
      for (const next of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        const [nr, nc] = next
        if (nr < 1 || nr > 23 || nc < 1 || nc > 23) continue
        const cost = costs.get(id(current)) + grid[nr][nc]
        if (cost >= (costs.get(id(next)) ?? Infinity)) continue
        costs.set(id(next), cost); parents.set(id(next), current); queue.push(next)
      }
    }
    let target = null, best = Infinity
    for (let r = 1; r < 24; r++) for (let c = 1; c < 24; c++) {
      const cost = costs.get(id([r, c]))
      if (!grid[r][c] && cost > 0 && cost < best) { target = [r, c]; best = cost }
    }
    if (!target) return grid
    while (target) { grid[target[0]][target[1]] = 0; target = parents.get(id(target)) }
  }
}
