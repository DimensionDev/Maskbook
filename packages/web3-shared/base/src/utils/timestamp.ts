const ETHEREUM_GENESIS_BLOCK_DATE = 1262304000000 // 2010-01-01

export function isValidTimestamp(time?: number) {
    if (!time) return false
    if (time.toString().length === 10) return time * 1000 >= ETHEREUM_GENESIS_BLOCK_DATE
    return time >= ETHEREUM_GENESIS_BLOCK_DATE
}
