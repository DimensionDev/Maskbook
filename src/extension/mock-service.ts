import { ProfileIdentifier } from '../database/type'

export const CryptoService: Partial<typeof import('./background-script/CryptoService')> = {
    async getMyProveBio() {
        return 'mock-prove-bio'
    },
}
export const WelcomeService: Partial<typeof import('./background-script/WelcomeService')> = {
    async backupMyKeyPair(a, b) {
        return { version: 1, whoami: [], grantedHostPermissions: [], maskbookVersion: 'mocked' }
    },
}
export const SteganographyService: Partial<typeof import('./background-script/SteganographyService')> = {
    async encodeImage() {
        return new Uint8Array()
    },
    async decodeImage() {
        return ''
    },
}
