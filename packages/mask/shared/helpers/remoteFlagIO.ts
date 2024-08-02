import type { RemoteFlagIO } from '@masknet/flags'
import { delay } from '@masknet/kit'

export const extensionRemoteFlagIO: RemoteFlagIO = {
    async getCache(url) {
        const { response, time } = (await browser.storage.local.get('remote-flag'))['remote-flag'] || {}
        if (!response) return null
        return { response, time }
    },
    async refetch(url) {
        const res = await fetch(url)
        const response = await res.text()
        browser.storage.local.set({ 'remote-flag': { response, time: Date.now() } })
        return response
    },
}

export const extensionRemoteFlagIONoFetch: RemoteFlagIO = {
    getCache: extensionRemoteFlagIO.getCache,
    async refetch(url, signal) {
        let times = 0
        while ((times += 1) < 10) {
            const cache = await extensionRemoteFlagIO.getCache(url, signal)
            if (cache) return cache.response
            await delay(10)
        }
        throw new Error('failed to get cache')
    },
}
