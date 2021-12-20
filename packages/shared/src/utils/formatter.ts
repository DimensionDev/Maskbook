export function formatFingerprint(fingerprint: string, size: number = 0) {
    if (size === 0) return fingerprint
    return `${fingerprint.slice(0, Math.max(0, 2 + size))}...${fingerprint.slice(-size)}`
}
