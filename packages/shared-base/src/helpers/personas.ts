import { ECKeyIdentifier, ProfileIdentifier } from '../index.js'
import type { PersonaIdentifier, PersonaInformation, ProfileInformation, Identifier } from '../index.js'

export function formatPersonaFingerprint(fingerprint: string, size?: number) {
    if (!size) {
        if (fingerprint.length <= 26) return fingerprint
        return `${fingerprint.slice(0, 17)}...${fingerprint.slice(-9)}`
    }

    if (size <= 0) return fingerprint
    return `${fingerprint.slice(0, Math.max(0, 2 + size))}...${fingerprint.slice(-size)}`
}

export const MAX_PERSONA_LIMIT = 10

export const MAX_PERSONA_NAME_LENGTH = 12

export const formatPersonaName = (nickname?: string) => {
    if (!nickname) return ''
    if (nickname.length < MAX_PERSONA_NAME_LENGTH) return nickname

    return `${nickname.slice(0, 12)}...`
}

function isSameIdentity<T extends Identifier>(
    formatString: (i: string) => T,
    ...identities: Array<T | { identifier: T } | string | undefined>
) {
    return identities.reduce((previousValue, currentIdentity, key) => {
        if (key === 0) return true
        const preIdentity = identities[key - 1]
        if (!currentIdentity || !preIdentity) return false

        const i1IdentifierText =
            typeof preIdentity === 'string'
                ? formatString(preIdentity).toText()
                : 'toText' in preIdentity
                ? preIdentity.toText()
                : preIdentity.identifier.toText()
        const i2IdentifierText =
            typeof currentIdentity === 'string'
                ? formatString(currentIdentity).toText()
                : 'toText' in currentIdentity
                ? currentIdentity.toText()
                : currentIdentity.identifier.toText()

        return previousValue && i1IdentifierText.toLowerCase() === i2IdentifierText.toLowerCase()
    }, false)
}

export function isSamePersona(...personas: Array<PersonaIdentifier | PersonaInformation | string | undefined>) {
    return isSameIdentity(
        (i) => {
            if (i.startsWith('ec_key:')) return ECKeyIdentifier.from(i).expect(`${i} should be a valid ECKeyIdentifier`)
            return new ECKeyIdentifier('secp256k1', i)
        },
        ...personas,
    )
}

export function isSameProfile(...profiles: Array<ProfileIdentifier | ProfileInformation | string | undefined>) {
    return isSameIdentity(
        (i) => ProfileIdentifier.from(i).expect(`${i} should be a valid ProfileIdentifier`),
        ...profiles,
    )
}
