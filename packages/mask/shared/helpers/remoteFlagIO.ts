import type { RemoteFlagIO } from '@masknet/flags'

export const extensionRemoteFlagIO: RemoteFlagIO = {
    async getCache(url) {
        const { response, time } = await browser.storage.local.get('remote-flag')
        if (!response) return null
        return { response, time }
    },
    async refetch(url) {
        const res = await fetch(url)
        const response = await res.text()
        await browser.storage.local.set({ 'remote-flag': { response, time: Date.now() } })
    },
}
