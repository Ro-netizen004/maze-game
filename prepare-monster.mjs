import fs from 'node:fs'
const source = fs.readFileSync('src/bioluminescent_deep_sea_stalker.main_design.glb')
const jsonLength = source.readUInt32LE(12)
const document = JSON.parse(source.subarray(20, 20 + jsonLength).toString())
function strip(value) {
  if (!value || typeof value !== 'object') return
  delete value.extras
  for (const child of Object.values(value)) strip(child)
}
strip(document)
const json = Buffer.from(JSON.stringify(document))
const padded = Buffer.alloc(Math.ceil(json.length / 4) * 4, 32)
json.copy(padded)
const binaryChunk = source.subarray(20 + jsonLength)
const output = Buffer.alloc(20 + padded.length + binaryChunk.length)
output.writeUInt32LE(0x46546c67, 0)
output.writeUInt32LE(2, 4)
output.writeUInt32LE(output.length, 8)
output.writeUInt32LE(padded.length, 12)
output.writeUInt32LE(0x4e4f534a, 16)
padded.copy(output, 20)
binaryChunk.copy(output, 20 + padded.length)
fs.mkdirSync('public/models/custom-stalker', { recursive: true })
fs.writeFileSync('public/models/custom-stalker/monster.glb', output)
console.log(`Monster: ${source.length} -> ${output.length} bytes; geometry preserved.`)
console.log(document.nodes.filter(n => n.children && n.name).map(n => n.name).join(', '))
