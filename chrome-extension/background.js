const PRACTICE_URL = 'https://health.sharecapsule.org/#/activity/thirumoolar'
const PRACTICE_WINDOW_WIDTH = 560
const PRACTICE_WINDOW_HEIGHT = 820

let practiceWindowId = null

async function openPractice() {
  if (practiceWindowId !== null) {
    try {
      await chrome.windows.update(practiceWindowId, { focused: true })
      return
    } catch {
      practiceWindowId = null
    }
  }

  const created = await chrome.windows.create({
    url: PRACTICE_URL,
    type: 'popup',
    width: PRACTICE_WINDOW_WIDTH,
    height: PRACTICE_WINDOW_HEIGHT,
    focused: true,
  })

  practiceWindowId = created?.id ?? null
}

chrome.action.onClicked.addListener(() => {
  void openPractice()
})

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === practiceWindowId) practiceWindowId = null
})
