import { memo, useMemo } from 'react'
import { cellPosition } from './levels'
import { lightpostLayout } from './mazeLighting.js'
import LanternLights from './LanternLights.jsx'

function MazeAtmosphere({ level, mobile, shadowSize = 1024, power = 1 }) {
  const fixtures = useMemo(() => lightpostLayout(level,mobile), [level, mobile])
  const warm = level.theme === 'temple' ? '#8be1df' : '#ffcf8b'
  return <group>
    <directionalLight position={[8, 14, -6]} color="#a0bed0" intensity={0.65} castShadow
      shadow-mapSize={[shadowSize, shadowSize]}
      shadow-camera-left={-17} shadow-camera-right={17} shadow-camera-top={17} shadow-camera-bottom={-17}
      shadow-camera-far={45} shadow-normalBias={0.035} shadow-bias={-0.0001} />
    <LanternLights fixtures={fixtures} mobile={mobile} color={warm} power={power} />
    {fixtures.map(({ id,position,color:fixtureColor }) => {
      const [x,,z]=position
      const lampColor=fixtureColor||warm
      return <group key={id} position={[x,2.2,z]}>
        <mesh position={[0, -1.1, 0]}><cylinderGeometry args={[0.045, 0.07, 2.2, 6]} /><meshStandardMaterial color="#39453b" roughness={0.9} /></mesh>
        <mesh castShadow><boxGeometry args={[0.18, 0.42, 0.18]} /><meshStandardMaterial color="#26363c" metalness={0.65} roughness={0.4} /></mesh>
        <mesh><boxGeometry args={[0.19, 0.23, 0.19]} /><meshStandardMaterial color={power ? lampColor : '#26363c'} emissive={lampColor} emissiveIntensity={2*power} /></mesh>
        {[0.17, -0.17].map(y => <mesh key={y} position={[0, y, 0]}><boxGeometry args={[0.26, 0.06, 0.26]} /><meshStandardMaterial color="#33454b" metalness={0.65} roughness={0.4} /></mesh>)}
        <mesh position={[0,-2.18,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[1.05,24]} /><meshBasicMaterial color={lampColor} transparent opacity={0.07*power} depthWrite={false} /></mesh>
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

export default memo(MazeAtmosphere)
