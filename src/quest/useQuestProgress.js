import { useState } from 'react'
import { canActivateShrine, canCollectOffering } from './objectives.js'

export default function useQuestProgress(level, onNotice) {
  const [collectedKeys, setCollectedKeys] = useState([])
  const [collectedOfferings, setCollectedOfferings] = useState([])
  const [openedDoors, setOpenedDoors] = useState([])
  const [activatedShrines, setActivatedShrines] = useState([])

  function collectKey(id) {
    const key = level.keys.find(item => item.id === id)
    if (!key || collectedKeys.includes(id)) return
    setCollectedKeys(items => items.includes(id) ? items : [...items, id])
    onNotice({ name: key.name, color: key.color })
  }

  function collectOffering(id) {
    const offering = level.offerings.find(item => item.id === id)
    if (!offering || collectedOfferings.includes(id)
      || !canCollectOffering(offering, openedDoors, activatedShrines, collectedOfferings)) return
    setCollectedOfferings(items => items.includes(id) ? items : [...items, id])
    onNotice({ name: offering.name, color: offering.color, message: offering.clue })
  }

  function activateShrine(id) {
    const shrine = level.shrines.find(item => item.id === id)
    if (!shrine || activatedShrines.includes(id)
      || !canActivateShrine(shrine, openedDoors, activatedShrines, collectedOfferings)) return
    setActivatedShrines(items => items.includes(id) ? items : [...items, id])
    onNotice({ name: shrine.name, color: shrine.color,
      message: `${shrine.name} is lit — both relics placed on the rune.` })
  }

  function openDoor(id) {
    setOpenedDoors(items => items.includes(id) ? items : [...items, id])
  }

  function resetQuest() {
    setCollectedKeys([])
    setCollectedOfferings([])
    setOpenedDoors([])
    setActivatedShrines([])
  }

  return { collectedKeys, collectedOfferings, openedDoors, activatedShrines,
    collectKey, collectOffering, activateShrine, openDoor, resetQuest }
}
