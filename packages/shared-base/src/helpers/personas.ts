import {
    type ProfileIdentifier,
    type PersonaIdentifier,
    type PersonaInformation,
    type ProfileInformation,
    Identifier,
} from '../index.js'

export function formatPersonaFingerprint(fingerprint: string, size?: number) {
    if (!size) {
        if (fingerprint.length <= 26) return fingerprint
        return `${fingerprint.slice(0, 12)}...${fingerprint.slice(-9)}`
    }

    if (size <= 0) return fingerprint
    return `${fingerprint.slice(0, Math.max(0, 2 + size))}...${fingerprint.slice(-size)}`
}

export const MAX_PERSONA_LIMIT = 10

export const MAX_PERSONA_NAME_LENGTH = 12

export const formatPersonaName = (nickname?: string) => {
    if (typeof nickname !== 'string') return ''
    if (nickname.length < MAX_PERSONA_NAME_LENGTH) return nickname

    return `${nickname.slice(0, 12)}...`
}

function isSameIdentity<T extends Identifier>(identities: Array<T | { identifier: T } | undefined>) {
    return identities.reduce((previousValue, T2, key) => {
        if (key === 0) return true
        const T1 = identities[key - 1]
        if (!T2 || !T1) return false

        const i1IdentifierText = (T1 instanceof Identifier ? T1 : T1.identifier).toText()
        const i2IdentifierText = (T2 instanceof Identifier ? T2 : T2.identifier).toText()

        return previousValue && i1IdentifierText.toLowerCase() === i2IdentifierText.toLowerCase()
    }, false)
}

export function isSamePersona(...personas: Array<PersonaIdentifier | PersonaInformation | undefined>) {
    return isSameIdentity(personas)
}

export function isSameProfile(...profiles: Array<ProfileIdentifier | ProfileInformation | undefined>) {
    return isSameIdentity(profiles)
}
