import Dexie, { type Table } from 'dexie'
import type { Record } from '../types'

class NightDB extends Dexie {
  records!: Table<Record>

  constructor() {
    super('night-db')
    this.version(1).stores({
      records: 'id, timestamp, emotionTags, triggerType',
    })
  }
}

export const db = new NightDB()
