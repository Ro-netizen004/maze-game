export const ritualDefinitions = [
    { id: 'sun-ember', name: 'Sun Ember', rune: 'dawn', color: '#ffbd65', requiresDoors: ['ruby'], requiresShrines: [], clue: 'Carry the Sun Ember to Dawn in Sunwell Clearing.' },
    { id: 'moon-tear', name: 'Moon Tear', rune: 'moon', color: '#b9a5ff', requiresDoors: ['ruby', 'sapphire'], requiresShrines: ['dawn'], clue: 'Carry the Moon Tear to Moon in Moonwell Clearing.' },
    { id: 'watcher-eye', name: 'Watcher’s Eye', rune: 'watch', color: '#74d4ca', requiresDoors: ['ruby', 'sapphire'], requiresShrines: ['dawn', 'moon'], clue: 'Dawn and Moon have released the Watcher’s Eye. Return it to the Watcher’s Court.' },
  ]

export const objectiveSteps = [
    ['key','ruby','Find the Ruby key to break the first seal.'],
    ['door','ruby','Open the Ruby seal to awaken the Dawn rune.'],
    ['offering','sun-ember','Find the Sun Ember on the maze trails and carry it to Sunwell Clearing.'],
    ['offering','dawn-candle','The Sun Ember revealed the Dawn Candle — find it on the maze trails.'],
    ['rune','dawn','Offer the Sun Ember and Dawn Candle in Sunwell Clearing.'],
    ['key','sapphire','Find the Sapphire key beyond the Ruby seal.'],
    ['door','sapphire','Open the Sapphire seal to awaken the Moon rune.'],
    ['offering','moon-tear','Find the Moon Tear on the maze trails and carry it to Moonwell Clearing.'],
    ['offering','moon-candle','The Moon Tear revealed the Moon Candle — find it on the maze trails.'],
    ['rune','moon','Offer the Moon Tear and Moon Candle in Moonwell Clearing.'],
    ['offering','watcher-eye','Dawn and Moon released the Watcher’s Eye — find it on the maze trails.'],
    ['offering','watch-candle','The Watcher’s Eye revealed the Watcher Candle — find it on the maze trails.'],
    ['rune','watch','Offer the Watcher’s Eye and Watcher Candle in the Watcher’s Court to release the exit.'],
  ]
