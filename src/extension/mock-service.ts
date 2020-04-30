import { ProfileIdentifier } from '../database/type'

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
