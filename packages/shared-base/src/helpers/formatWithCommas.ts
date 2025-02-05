export function formatWithCommas(val: number | string | bigint) {
    if (!val) return val
    const bn = BigInt(val)
    return bn.toLocaleString('en-US')
}
