export async function getCurrentTabId() {
    const tabs = await browser.tabs.query({ currentWindow: true, active: true })
    return tabs[0].id
}
