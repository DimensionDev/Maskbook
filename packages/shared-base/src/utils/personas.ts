export function formatPersonaFingerprint(fingerprint: string, size = 0) {
    if (size === 0) return fingerprint
    return `${fingerprint.substr(0, 2 + size)}...${fingerprint.substr(-size)}`
}
export const MAX_PERSONA_LIMIT = 10

export const MAX_PERSONA_NAME_LENGTH = 12

export const formatPersonaName = (nickname?: string) => {
    if (!nickname) return ''
    if (nickname.length < MAX_PERSONA_NAME_LENGTH) return nickname

    return `${nickname.substring(0, 12)}...`
}
