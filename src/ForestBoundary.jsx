import { memo, useMemo } from 'react'
import { Instances } from './ForestMaze'

function ForestBoundary({ bounds }) {
  const posts = useMemo(() => {
    const items = []
    for (let x = bounds.left; x <= bounds.right; x += 5) {
      for (const z of [bounds.front, bounds.back]) items.push({ position: [x, 0.5, z], scale: [0.1, 1, 0.1], color: '#8d8061' })
    }
    for (let z = bounds.front + 5; z < bounds.back; z += 5) {
      for (const x of [bounds.left, bounds.right]) items.push({ position: [x, 0.5, z], scale: [0.1, 1, 0.1], color: '#8d8061' })
    }
    return items
  }, [bounds])
  const ropes = useMemo(() => {
    const cx = (bounds.left + bounds.right) / 2, cz = (bounds.front + bounds.back) / 2
    return [
      ...[bounds.front, bounds.back].map(z => ({ position: [cx, 0.75, z], scale: [bounds.right - bounds.left, 0.025, 0.025], color: '#b5a27a' })),
      ...[bounds.left, bounds.right].map(x => ({ position: [x, 0.75, cz], scale: [0.025, 0.025, bounds.back - bounds.front], color: '#b5a27a' })),
    ]
  }, [bounds])
  return <group>
    <Instances items={posts} shadows={false}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial roughness={1} /></Instances>
    <Instances items={ropes} shadows={false}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial roughness={1} /></Instances>
  </group>
}
export default memo(ForestBoundary)
