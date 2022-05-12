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
