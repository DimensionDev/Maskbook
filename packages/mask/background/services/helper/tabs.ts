export async function getActiveTab(): Promise<undefined | { id: number | undefined; url: string | undefined }> {
    const [tab] = await browser.tabs.query({ currentWindow: true, active: true, windowType: 'normal' })
    if (!tab) return undefined
    return {
        id: tab.id,
        url: tab.url,
    }
}
