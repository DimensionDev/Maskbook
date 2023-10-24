export async function getActiveTabId() {
    const tabs = await browser.tabs.query({ currentWindow: true, active: true, windowType: 'normal' })
    return tabs[0]?.id
}
