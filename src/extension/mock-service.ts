import { sleep } from '../utils/utils'

export const CryptoService: Partial<typeof import('./background-script/CryptoService')> = {
    async getMyProveBio() {
        return 'mock-prove-bio'
    },
}
export const WelcomeService: Partial<typeof import('./background-script/WelcomeService')> = {
    async createBackupFile(b) {
        return {
            _meta_: { createdAt: 0, maskbookVersion: 'mocked', type: 'maskbook-backup', version: 2 },
            grantedHostPermissions: [],
            personas: [],
            posts: [],
            wallets: [],
            profiles: [],
            userGroups: [],
        }
    },
}
export const SteganographyService: Partial<typeof import('./background-script/SteganographyService')> = {
    async encodeImage() {
        return ''
    },
    async decodeImage() {
        return ''
    },
}

export const HelperService: Partial<typeof import('./background-script/HelperService')> = {
    async fetch(url) {
        console.log('Fetching by mock')
        await sleep(1000)
        return globalThis.fetch(url).then((x) => x.blob())
    },
}

export const PluginService: Partial<typeof import('./background-script/PluginService')> = {
    invokePlugin() {
        return new Promise(() => {})
    },
}
