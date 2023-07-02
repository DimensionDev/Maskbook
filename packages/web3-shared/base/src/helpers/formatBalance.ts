import { BigNumber } from 'bignumber.js'
import { pow10 } from './number.js'

export function formatBalance(
    rawValue: BigNumber.Value = '0',
    decimals = 0,
    significant = decimals,
    isPrecise = false,
) {
    let balance = new BigNumber(rawValue)
    if (!balance.isInteger()) {
        const message = `Expected an integer but got ${balance.toFixed()}`
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
            throw new Error(message)
        } else {
            console.error(message)
        }
    }
    balance = balance.integerValue()
    if (balance.isNaN()) return '0'

    const base = pow10(decimals) // 10n ** decimals
    if (balance.div(base).lt(pow10(-8)) && balance.isGreaterThan(0) && !isPrecise) return '<0.000001'

    const negative = balance.isNegative() // balance < 0n
    if (negative) balance = balance.absoluteValue() // balance * -1n

    let fraction = balance.modulo(base).toString(10) // (balance % base).toString(10)

    // add leading zeros
    while (fraction.length < decimals) fraction = `0${fraction}`
    // keep up to 6 decimal places
    fraction = fraction.slice(0, balance.div(base).gt(pow10(-6)) ? 6 : 8)

    // match significant digits
    const matchSignificantDigits = new RegExp(`^0*[1-9]\\d{0,${significant > 0 ? significant - 1 : 0}}`)
    fraction = fraction.match(matchSignificantDigits)?.[0] ?? ''

    // trim tailing zeros
    fraction = fraction.replaceAll(/0+$/g, '')
    const whole = balance.dividedToIntegerBy(base).toString(10) // (balance / base).toString(10)
    const value = `${whole}${fraction === '' ? '' : `.${fraction}`}`

    const raw = negative ? `-${value}` : value
    return raw.includes('.') ? raw.replace(/0+$/, '').replace(/\.$/, '') : raw
}
