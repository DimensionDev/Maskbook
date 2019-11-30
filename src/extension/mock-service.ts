import { PersonIdentifier } from '../database/type'

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
export const PeopleService: Partial<typeof import('./background-script/PeopleService')> = {
    async queryPeople() {
        const demoPeople = [
            {
                fingerprint: 'FDFE333CE20ED446AD88F3C8BA3AD1AA5ECAF521',
                avatar: 'https://avatars3.githubusercontent.com/u/5390719?s=460&v=4',
                nickname: 'Jack Works',
                identifier: new PersonIdentifier('localhost', 'test'),
                groups: [],
            },
            {
                fingerprint: 'FDFE333CE20ED446AD88F3C8BA3AD1AA5ECAF521'
                    .split('')
                    .reverse()
                    .join(''),
                avatar: 'https://avatars1.githubusercontent.com/u/3343358?s=460&v=4',
                nickname: 'Robot of the century',
                identifier: new PersonIdentifier('localhost', 'test'),
                groups: [],
            },
            {
                fingerprint: 'a2f7643cd1aed446ad88f3c8ba13843dfa2f321d',
                nickname: 'Material Design',
                identifier: new PersonIdentifier('localhost', 'test'),
                groups: [],
            },
            {
                fingerprint: 'a2f7643cd1aed446ad88f3c8ba13843dfa2f321d',
                nickname: 'コノハ',
                identifier: new PersonIdentifier('localhost', 'test'),
                groups: [],
            },
        ]
        return demoPeople
    },
    async queryMyIdentities() {
        return [
            {
                fingerprint: 'FDFE333CE20ED446AD88F3C8BA3AD1AA5ECAF521',
                avatar: 'https://avatars3.githubusercontent.com/u/5390719?s=460&v=4',
                nickname: 'Jack Works',
                identifier: new PersonIdentifier('localhost', 'test'),
                groups: [],
            },
        ]
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
