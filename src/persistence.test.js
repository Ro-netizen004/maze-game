import test from 'node:test'
import assert from 'node:assert/strict'
import {
  STORAGE_KEY, bestTimeKey, createDefaultProgress, loadProgress, parseProgress, recordWin, saveProgress,
} from './persistence.js'

test('progress parsing safely handles invalid and obsolete data', () => {
  assert.deepEqual(parseProgress('{nope'), createDefaultProgress())
  assert.deepEqual(parseProgress(JSON.stringify({ version: 0, unlockedLevel: 99 })), createDefaultProgress())
})

test('progress is normalized and can round-trip through storage', () => {
  const storage = new Map()
  const adapter = {
    getItem: key => storage.get(key),
    setItem: (key, value) => storage.set(key, value),
  }
  saveProgress({ version: 1, unlockedLevel: 2.8, difficulty: 'hard', bestTimes: { ok: 123, bad: -1 }, settings: { lookSensitivity: 99 } }, adapter)
  const loaded = loadProgress(adapter)
  assert.equal(loaded.unlockedLevel, 2)
  assert.equal(loaded.difficulty, 'hard')
  assert.deepEqual(loaded.bestTimes, { ok: 123 })
  assert.equal(loaded.settings.lookSensitivity, 2)
  assert.ok(storage.has(STORAGE_KEY))
})

test('wins unlock sequential levels and only improve best times', () => {
  let progress = recordWin(createDefaultProgress(), 'stone', 'normal', 5000, 0, 3)
  progress = recordWin(progress, 'stone', 'normal', 6000, 0, 3)
  assert.equal(progress.unlockedLevel, 1)
  assert.equal(progress.bestTimes[bestTimeKey('stone', 'normal')], 5000)
  progress = recordWin(progress, 'amber', 'normal', 4000, 1, 3)
  assert.equal(progress.unlockedLevel, 2)
})
