import { first } from 'lodash-unified'

export async function openOrActiveTab(url?: string) {
    if (!url) return

    const openedTabs = await browser.tabs.query({ url: `${url}/*` })
    const targetTab = openedTabs.find((x) => x.active) ?? first(openedTabs)

    if (targetTab?.id) {
        await browser.tabs.update(targetTab.id, {
            active: true,
        })
        await browser.windows.update(targetTab.windowId, { focused: true })
    } else {
        await browser.tabs.create({ active: true, url })
    }
}
