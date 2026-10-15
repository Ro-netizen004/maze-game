// Hand-placed loops use original layout coordinates; padding only shifts them.
// Endpoints stay in the same seal region, so extra escape routes cannot skip gates.
const routePlans = {
  Stonegate: [
    { id: 'east-weave', points: [[3, 5], [3, 7]] },
    { id: 'lower-crossing', points: [[5, 3], [5, 5]] },
    { id: 'west-flank', points: [[5, 1], [5, -1], [7, -1], [7, 1]] },
    { id: 'moonwell-return', points: [[-2, 6], [-2, 8], [1, 8], [1, 7]] },
  ],
  'Amber Halls': [
    { id: 'keepers-crossing', points: [[3, 3], [3, 5]] },
    { id: 'eastern-weave', points: [[5, 7], [7, 7]] },
    { id: 'west-flank', points: [[7, 1], [7, -1], [9, -1], [9, 1]] },
    { id: 'moonwell-return', points: [[-2, 8], [-2, 10], [1, 10], [1, 9]] },
  ],
  'Twilight Labyrinth': [
    { id: 'upper-crossing', points: [[3, 3], [3, 5]] },
    { id: 'southern-weave', points: [[9, 9], [11, 9]] },
    { id: 'west-flank', points: [[9, 1], [9, -1], [11, -1], [11, 1]] },
    { id: 'moonwell-return', points: [[-2, 8], [-2, 10], [1, 10]] },
  ],
}

function trace(points) {
  const cells = [points[0]]
  for (let index = 1; index < points.length; index++) {
    const [r, c] = points[index - 1], [endR, endC] = points[index]
    if (r !== endR && c !== endC) throw new Error('Maze routes must follow grid segments')
    const dr = Math.sign(endR - r), dc = Math.sign(endC - c)
    const length = Math.abs(endR - r) + Math.abs(endC - c)
    for (let step = 1; step <= length; step++) cells.push([r + dr * step, c + dc * step])
  }
  return cells
}

export function addEscapeRoutes(level) {
  const grid = level.grid.map(row => [...row])
  const shift = ([r, c]) => [r + level.mapOffset, c + level.mapOffset]
  function carve(cell) {
    const [r, c] = cell
    if (r <= 0 || c <= 0 || r >= grid.length - 1 || c >= grid[0].length - 1) throw new Error('Escape route must remain inside the forest boundary')
    grid[r][c] = 0
  }
  const escapeRoutes = routePlans[level.layoutName || level.name].map(plan => {
    const cells = trace(plan.points).map(shift)
    cells.forEach(carve)
    return { id: plan.id, cells, endpoints: [cells[0], cells[cells.length - 1]] }
  })
  const originalRows = level.originalGrid.length
  const branchRow = originalRows - 2
  const moonReturn = routePlans[level.layoutName || level.name].find(route => route.id === 'moonwell-return')
  const outerColumn = moonReturn.points[1][1]
  const deadEndBranches = [
    { id: 'western-dead-end', cells: trace([[branchRow, -1], [originalRows + 1, -1]]).map(shift) },
    { id: 'northern-dead-end', cells: trace([[-2, outerColumn], [-4, outerColumn]]).map(shift) },
  ]
  deadEndBranches.forEach(branch => branch.cells.forEach(carve))
  return { ...level, grid, escapeRoutes, deadEndBranches }
}
