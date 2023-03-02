const ETHEREUM_GENESIS_BLOCK_DATE = 1_262_304_000_000 // 2010-01-01

export function isValidTimestamp(time?: number) {
    if (!time) return false
    return time >= ETHEREUM_GENESIS_BLOCK_DATE
}
