export const STORAGE_KEY = 'maze:progress'
export const STORAGE_VERSION = 1

export const defaultSettings = Object.freeze({
  lookSensitivity: 1,
  invertY: false,
  reducedMotion: false,
  flashlightIntensity: 65,
  graphicsQuality: 'balanced',
})

export function createDefaultProgress() {
  return {
    version: STORAGE_VERSION,
    unlockedLevel: 0,
    bestTimes: {},
    difficulty: 'normal',
    settings: { ...defaultSettings },
  }
}

const finite = value => typeof value === 'number' && Number.isFinite(value)

export function normalizeProgress(value) {
  const defaults = createDefaultProgress()
  if (!value || typeof value !== 'object' || value.version !== STORAGE_VERSION) return defaults
  const settings = value.settings && typeof value.settings === 'object' ? value.settings : {}
  const bestTimes = {}
  if (value.bestTimes && typeof value.bestTimes === 'object') {
    for (const [key, time] of Object.entries(value.bestTimes)) {
      if (finite(time) && time >= 0) bestTimes[key] = time
    }
  }
  return {
    version: STORAGE_VERSION,
    unlockedLevel: finite(value.unlockedLevel) ? Math.max(0, Math.floor(value.unlockedLevel)) : 0,
    bestTimes,
    difficulty: ['easy', 'normal', 'hard'].includes(value.difficulty) ? value.difficulty : defaults.difficulty,
    settings: {
      graphicsQuality: ['performance', 'balanced', 'high'].includes(settings.graphicsQuality) ? settings.graphicsQuality : defaults.settings.graphicsQuality,
      lookSensitivity: finite(settings.lookSensitivity)
        ? Math.max(0.25, Math.min(2, settings.lookSensitivity))
        : defaults.settings.lookSensitivity,
      invertY: typeof settings.invertY === 'boolean' ? settings.invertY : defaults.settings.invertY,
      reducedMotion: typeof settings.reducedMotion === 'boolean' ? settings.reducedMotion : defaults.settings.reducedMotion,
      flashlightIntensity: finite(settings.flashlightIntensity)
        ? Math.max(20, Math.min(100, settings.flashlightIntensity))
        : defaults.settings.flashlightIntensity,
    },
  }
}

export function parseProgress(raw) {
  if (!raw) return createDefaultProgress()
  try {
    return normalizeProgress(JSON.parse(raw))
  } catch {
    return createDefaultProgress()
  }
}

export function loadProgress(storage = globalThis.localStorage) {
  try {
    return parseProgress(storage?.getItem(STORAGE_KEY))
  } catch {
    return createDefaultProgress()
  }
}

export function saveProgress(progress, storage = globalThis.localStorage) {
  const safe = normalizeProgress(progress)
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(safe))
  } catch {
    // Storage may be unavailable or full; gameplay should continue.
  }
  return safe
}

export function bestTimeKey(levelId, difficulty) {
  return `${levelId}:${difficulty}`
}

export function recordWin(progress, levelId, difficulty, elapsed, levelIndex, levelCount) {
  const next = normalizeProgress(progress)
  const key = bestTimeKey(levelId, difficulty)
  const previous = next.bestTimes[key]
  if (finite(elapsed) && elapsed >= 0 && (previous === undefined || elapsed < previous)) {
    next.bestTimes[key] = elapsed
  }
  next.unlockedLevel = Math.min(levelCount - 1, Math.max(next.unlockedLevel, levelIndex + 1))
  return next
}
