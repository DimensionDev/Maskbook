export function formatBalance(balance: bigint, decimals: number, precision: number = 6) {
    const negative = balance < 0
    const base = BigInt(10) ** BigInt(decimals)

    if (negative) {
        balance = balance * BigInt(-1)
    }

    let fraction = (balance % base).toString(10)

    while (fraction.length < decimals) {
        fraction = `0${fraction}`
    }

    const whole = (balance / base).toString(10)
    const value = `${whole}${fraction == '0' ? '' : `.${fraction.substr(0, precision)}`}` // eslint-disable-line

    return (negative ? `-${value}` : value).replace(/0+$/, '').replace(/\.$/, '')
}
