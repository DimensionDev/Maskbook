import BigNumber from 'bignumber.js'
import { pow10 } from './number'

export function formatBalance(rawValue: BigNumber.Value = '0', decimals = 0, significant = decimals) {
    let balance = new BigNumber(rawValue)
    if (balance.isNaN()) return '0'
    const negative = balance.isNegative() // balance < 0n
    const base = pow10(decimals) // 10n ** decimals
    if (balance.isLessThan(0.000001)) return '<0.0000001'
    if (negative) balance = balance.absoluteValue() // balance * -1n

    let fraction = balance.modulo(base).toString(10) // (balance % base).toString(10)

    // add leading zeros
    while (fraction.length < decimals) fraction = `0${fraction}`

    // match significant digits
    const matchSignificantDigits = new RegExp(`^0*[1-9]\\d{0,${significant > 0 ? significant - 1 : 0}}`)
    fraction = fraction.match(matchSignificantDigits)?.[0] ?? ''

    // trim tailing zeros
    fraction = fraction.replace(/0+$/g, '')

    const whole = balance.dividedToIntegerBy(base).toString(10) // (balance / base).toString(10)
    const value = `${whole}${fraction === '' ? '' : `.${fraction}`}`

    const raw = negative ? `-${value}` : value
    return raw.includes('.') ? raw.replace(/0+$/, '').replace(/\.$/, '') : raw
}
