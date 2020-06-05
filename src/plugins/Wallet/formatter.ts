import { BigNumber } from 'bignumber.js'

export function formatBalance(balance: BigNumber | undefined, decimals: number, precision: number = 6) {
    if (!BigNumber.isBigNumber(balance)) {
        return
    }

    const negative = balance.isNegative() // balance < 0n
    const base = new BigNumber(10).pow(decimals) // 10n ** decimals

    if (negative) {
        balance = balance.absoluteValue() // balance * -1n
    }

    let fraction = balance.modulo(base).toString(10) // (balance % base).toString(10)

    while (fraction.length < decimals) {
        fraction = `0${fraction}`
    }

    const whole = balance.dividedToIntegerBy(base).toString(10) // (balance / base).toString(10)
    const value = `${whole}${fraction == '0' ? '' : `.${fraction.substr(0, precision)}`}` // eslint-disable-line
    const raw = negative ? `-${value}` : value

    return raw.indexOf('.') > -1 ? raw.replace(/0+$/, '').replace(/\.$/, '') : raw
}
