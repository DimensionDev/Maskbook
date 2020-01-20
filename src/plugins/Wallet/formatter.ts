export function formatBalance(balance: bigint, decimals: number, precision: number = 6) {
    const divisor = BigInt(10) ** BigInt(decimals)

    const a = balance / divisor
    const b = balance % divisor
    return `${a}.${b.toString().substr(0, precision)}`.replace(/0+$/, '').replace(/\.$/, '')
}
