import type { PersonaIdentifier, PersonaInformation, ProfileIdentifier, ProfileInformation } from '../index.js'

export function formatPersonaFingerprint(fingerprint: string, size = 0) {
    if (size === 0) return fingerprint
    return `${fingerprint.slice(0, Math.max(0, 2 + size))}...${fingerprint.slice(-size)}`
}
export const MAX_PERSONA_LIMIT = 10

export const MAX_PERSONA_NAME_LENGTH = 12

export const formatPersonaName = (nickname?: string) => {
    if (!nickname) return ''
    if (nickname.length < MAX_PERSONA_NAME_LENGTH) return nickname

    return `${nickname.slice(0, 12)}...`
}

export function formatPersonaPublicKey(address: string, size = 0) {
    if (size === 0 || size >= 20) return address
    return `${address.slice(0, Math.max(0, 2 + size))}...${address.slice(-size)}`
}

export function isSamePersona(...personas: Array<PersonaIdentifier | PersonaInformation | undefined>) {
    return personas.reduce((previousValue, currentValue, key) => {
        if (key === 0 || !currentValue) return false
        const p1Identifier =
            'toText' in personas[key - 1]!
                ? (personas[key - 1] as PersonaIdentifier)
                : (personas[key - 1] as PersonaInformation).identifier
        const p2Identifier = 'toText' in currentValue ? currentValue : currentValue.identifier
        return previousValue && p1Identifier.toText() === p2Identifier.toText()
    }, false)
}

export function currySamePersona(persona?: PersonaIdentifier | PersonaInformation) {
    return (...personas: Array<PersonaIdentifier | PersonaInformation | undefined>) =>
        isSamePersona(...[persona, ...personas])
}

export function isSameProfile(...personas: Array<ProfileIdentifier | ProfileInformation | undefined>) {
    return personas.reduce((previousValue, currentValue, key) => {
        if (key === 0 || !currentValue) return false
        const p1Identifier =
            'toText' in personas[key - 1]!
                ? (personas[key - 1] as ProfileIdentifier)
                : (personas[key - 1] as ProfileInformation).identifier
        const p2Identifier = 'toText' in currentValue ? currentValue : currentValue.identifier
        return previousValue && p1Identifier.toText() === p2Identifier.toText()
    }, false)
}

export function currySameProfile(profile?: ProfileIdentifier | ProfileInformation) {
    return (...profiles: Array<ProfileIdentifier | ProfileInformation | undefined>) =>
        isSameProfile(...[profile, ...profiles])
}
