export async function getActiveTabFacebook() {
    const [tab] = await browser.tabs.query({
        url: ['https://www.facebook.com/*', 'https://m.facebook.com/*'],
        pinned: false,
    })
    if (tab) return tab.id
    return undefined
}
