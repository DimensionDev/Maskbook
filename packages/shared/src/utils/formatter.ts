export function formatFingerprint(fingerprint: string, size = 0) {
    if (size === 0) return fingerprint
    return `${fingerprint.substr(0, 2 + size)}...${fingerprint.substr(-size)}`
}
