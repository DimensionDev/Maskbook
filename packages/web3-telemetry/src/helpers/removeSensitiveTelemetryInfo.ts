export function removeSensitiveTelemetryInfo(text?: string) {
    if (!text) return text
    return text
        .replaceAll(/\b0x[\da-f]{40}\b/giu, '[ethereum address]')
        .replaceAll(/\b0x[\da-f]{16}\b/giu, '[flow address]')
        .replaceAll(/\b0x[\da-f]{32,}\b/giu, '[key]')
        .replaceAll(/\b[\da-f]{32,}\b/giu, '[key]')
        .replaceAll(/\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/gu, '[solana address]')
}
