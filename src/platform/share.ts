import { Share } from '@capacitor/share'
import { isNativeApp } from './runtime'

export const THIRUMOOLAR_SHARE_URL = 'https://health.sharecapsule.org/#/activity/thirumoolar'

const THIRUMOOLAR_SHARE_TITLE = 'Thirumoolar 1:4:2 breathing · Vital by ShareCapsule'
const THIRUMOOLAR_SHARE_TEXT = 'Try this guided Thirumoolar Pranayama 1:4:2 breathing practice in Vital by ShareCapsule.'

export type PracticeShareResult = 'shared' | 'copied' | 'cancelled' | 'failed'

function isCancelledShare(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError') return true
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
  return message.includes('cancel') || message.includes('abort')
}

async function copyShareLink(): Promise<PracticeShareResult> {
  try {
    await navigator.clipboard.writeText(THIRUMOOLAR_SHARE_URL)
    return 'copied'
  } catch {
    return 'failed'
  }
}

export async function shareThirumoolarPractice(): Promise<PracticeShareResult> {
  if (isNativeApp()) {
    try {
      await Share.share({
        title: THIRUMOOLAR_SHARE_TITLE,
        text: THIRUMOOLAR_SHARE_TEXT,
        url: THIRUMOOLAR_SHARE_URL,
        dialogTitle: 'Share breathing practice',
      })
      return 'shared'
    } catch (error) {
      if (isCancelledShare(error)) return 'cancelled'
      return copyShareLink()
    }
  }

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: THIRUMOOLAR_SHARE_TITLE,
        text: THIRUMOOLAR_SHARE_TEXT,
        url: THIRUMOOLAR_SHARE_URL,
      })
      return 'shared'
    } catch (error) {
      if (isCancelledShare(error)) return 'cancelled'
    }
  }

  return copyShareLink()
}
