import { APP_NAME, LEGACY_APP_NAME } from '../brand'

const PREFIX = 'sharecapsule-health:'

type SupportedBackupApp = typeof APP_NAME | typeof LEGACY_APP_NAME

type HealthBackup = {
  app: SupportedBackupApp
  version: 1
  exportedAt: string
  entries: Record<string, string>
}

function managedKeys() {
  const keys: string[] = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key?.startsWith(PREFIX)) keys.push(key)
  }
  return keys
}

export function exportLocalData() {
  const entries = Object.fromEntries(
    managedKeys().map((key) => [key, localStorage.getItem(key) ?? '']),
  )

  const backup: HealthBackup = {
    app: APP_NAME,
    version: 1,
    exportedAt: new Date().toISOString(),
    entries,
  }

  return JSON.stringify(backup, null, 2)
}

export function restoreLocalData(raw: string) {
  const parsed = JSON.parse(raw) as Partial<HealthBackup>
  const supportedApp = parsed.app === APP_NAME || parsed.app === LEGACY_APP_NAME
  if (!supportedApp || parsed.version !== 1 || !parsed.entries || typeof parsed.entries !== 'object') {
    throw new Error(`This file is not a supported ${APP_NAME} backup.`)
  }

  const entries = Object.entries(parsed.entries).filter(
    ([key, value]) => key.startsWith(PREFIX) && typeof value === 'string',
  )
  if (!entries.length) throw new Error(`The backup does not contain ${APP_NAME} data.`)

  clearLocalData()
  entries.forEach(([key, value]) => localStorage.setItem(key, value))
  return entries.length
}

export function clearLocalData() {
  managedKeys().forEach((key) => localStorage.removeItem(key))
}
