import { db } from './db'
import type { Record } from '../types'

export async function addRecord(record: Record): Promise<void> {
  await db.records.add(record)
}

export async function getRecords(limit = 50): Promise<Record[]> {
  return db.records
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray()
}

export async function getRecentRecord(): Promise<Record | undefined> {
  return db.records
    .orderBy('timestamp')
    .reverse()
    .first()
}

export async function getRecordCount(): Promise<number> {
  return db.records.count()
}
