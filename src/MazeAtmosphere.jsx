import { useMemo } from 'react'
import { cellPosition } from './levels'

export default function MazeAtmosphere({ level, mobile }) {
  const fixtures = useMemo(() => {
    if (level.openForest) return level.landmarks.map(item => ({ cell: item.cell, side: [0, 1] }))
    const candidates = []
    level.grid.forEach((row, r) => row.forEach((cell, c) => {
      if (cell !== 0 || r < 1 || c < 1) return
      const side = [[0, -1], [0, 1], [-1, 0], [1, 0]].find(([dr, dc]) => level.grid[r + dr]?.[c + dc] === 1)
      if (side && (r * 13 + c * 7) % 5 === 0) candidates.push({ cell: [r, c], side })
    }))
    return candidates.filter((_, index) => index % 2 === 0).slice(0, mobile ? 3 : 5)
  }, [level, mobile])
  const warm = level.theme === 'temple' ? '#8be1df' : '#ffcf8b'
  return <group>
    <directionalLight position={[8, 14, -6]} color="#a0bed0" intensity={0.8}
      shadow-mapSize={[mobile ? 512 : 1024, mobile ? 512 : 1024]}
      shadow-camera-left={-17} shadow-camera-right={17} shadow-camera-top={17} shadow-camera-bottom={-17}
      shadow-camera-far={45} shadow-normalBias={0.035} shadow-bias={-0.0001} />
    {fixtures.map(({ cell, side }, index) => {
      const [x, z] = cellPosition(level, cell)
      return <group key={cell.join(',')} position={[x + side[1] * 0.78, 1.95, z + side[0] * 0.78]}>
        <mesh position={[0, -1, 0]} castShadow><cylinderGeometry args={[0.045, 0.07, 1.9, 6]} /><meshStandardMaterial color="#39453b" roughness={0.9} /></mesh>
        <mesh castShadow><boxGeometry args={[0.18, 0.42, 0.18]} /><meshStandardMaterial color="#26363c" metalness={0.65} roughness={0.4} /></mesh>
        <mesh><boxGeometry args={[0.19, 0.23, 0.19]} /><meshStandardMaterial color={warm} emissive={warm} emissiveIntensity={2} /></mesh>
        {[0.17, -0.17].map(y => <mesh key={y} position={[0, y, 0]}><boxGeometry args={[0.26, 0.06, 0.26]} /><meshStandardMaterial color="#33454b" metalness={0.65} roughness={0.4} /></mesh>)}
        {index < 2 && <pointLight position={[-side[1] * 0.15, 0, -side[0] * 0.15]} color={warm} intensity={7} distance={5} decay={2}
          />}
      </group>
    })}
    {level.grid.flatMap((row, r) => row.map((cell, c) => {
      if (cell !== 0 || (r * 17 + c * 3) % 4 !== 0) return null
      const wall = [[0, -1], [0, 1], [-1, 0], [1, 0]].find(([dr, dc]) => level.grid[r + dr]?.[c + dc] === 1)
      if (!wall) return null
      const [x, z] = cellPosition(level, [r, c])
      return <group key={`moss-${r}-${c}`} position={[x + wall[1] * 0.85, 0.03, z + wall[0] * 0.85]}>
        <mesh rotation={[-Math.PI / 2, 0, c]} scale={[0.6, 0.25, 1]}><circleGeometry args={[0.55, 12]} /><meshStandardMaterial color="#354c3d" roughness={1} /></mesh>
        {[0, 1, 2].map(i => <mesh key={i} position={[(i - 1) * 0.1, 0.12, 0]} rotation={[0.1, i, (i - 1) * 0.3]}>
          <coneGeometry args={[0.035, 0.25 + i * 0.03, 3]} /><meshStandardMaterial color="#486553" roughness={1} />
        </mesh>)}
      </group>
    }))}
  </group>
}
