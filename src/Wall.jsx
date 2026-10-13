// All wall details stay inside the same 2 x 2 collision footprint.
function Block({ position, size, color, texture }) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} map={texture} bumpMap={texture} bumpScale={0.035} roughness={0.72} />
    </mesh>
  )
}

export default function Wall({ theme, color, texture, position }) {
  return (
    <group position={position}>
      {theme === 'stone' && <Block position={[0, 1.55, 0]} size={[2, 2.5, 2]} color={color} texture={texture} />}
      {theme === 'timber' && <Block position={[0, 1.5, 0]} size={[1.9, 3, 1.9]} color={color} texture={texture} />}
      {theme === 'temple' && <Block position={[0, 1.625, 0]} size={[1.8, 2.65, 1.8]} color={color} texture={texture} />}
      {theme === 'stone' && (
        <>
          <Block position={[0, 0.15, 0]} size={[2, 0.3, 2]} color="#374957" />
          <Block position={[0, 2.9, 0]} size={[2, 0.2, 2]} color="#81939d" />
          {[-0.7, 0.7].map(x => <Block key={x} position={[x, 3.2, 0]} size={[0.55, 0.4, 2]} color={color} texture={texture} />)}
        </>
      )}
      {theme === 'timber' && (
        <>
          {[-0.88, 0.88].flatMap(x => [-0.88, 0.88].map(z => (
            <Block key={`${x}-${z}`} position={[x, 1.55, z]} size={[0.24, 3.1, 0.24]} color="#49301f" texture={texture} />
          )))}
          {[0.2, 2.75].map(y => <Block key={y} position={[0, y, 0]} size={[1.96, 0.2, 1.96]} color="#49301f" texture={texture} />)}
        </>
      )}
      {theme === 'temple' && (
        <>
          <Block position={[0, 0.15, 0]} size={[2, 0.3, 2]} color="#b1a4c8" />
          <Block position={[0, 3.1, 0]} size={[2, 0.3, 2]} color="#b1a4c8" />
          {[-0.8, 0.8].flatMap(x => [-0.8, 0.8].map(z => (
            <mesh key={`${x}-${z}`} castShadow receiveShadow position={[x, 1.6, z]}>
              <cylinderGeometry args={[0.19, 0.19, 2.6, 8]} />
              <meshStandardMaterial color="#b1a4c8" roughness={0.7} />
            </mesh>
          )))}
        </>
      )}
    </group>
  )
}
