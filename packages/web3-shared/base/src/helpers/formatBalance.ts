import { BigNumber } from 'bignumber.js'
import { isLessThan, leftShift, pow10, scale10, trimZero } from './number.js'

export function formatBalance(
    rawValue: BigNumber.Value = '0',
    decimals = 0,
    significant = decimals,
    isPrecise = false,
    isFixed = false,
    fixedDecimals = 4,
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

    if (isFixed) {
        const value = leftShift(balance, decimals)
        const minimum = scale10(1, -fixedDecimals)
        if (value.eq(0)) return '0'
        if (isLessThan(value, minimum)) return '<' + minimum.toFixed()
        return trimZero(value.toFixed(4))
    }

    const base = pow10(decimals) // 10n ** decimals
    if (balance.div(base).lt(pow10(-8)) && balance.isGreaterThan(0) && !isPrecise) return '<0.000001'

    const negative = balance.isNegative() // balance < 0n
    if (negative) balance = balance.absoluteValue() // balance * -1n

    let fraction = balance.modulo(base).toString(10) // (balance % base).toString(10)

    // add leading zeros
    fraction = fraction.padStart(decimals, '0')
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
