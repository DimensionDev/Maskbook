import { BigNumber } from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'

export function formatPercentage(value: BigNumber) {
    return `${value
        .multipliedBy(100)
        .toFixed(2)
        .replace(/\.?0+$/, '')}%`
}

export function formatPrice(price: BigNumber, decimalPlaces: number = 6) {
    return price.decimalPlaces(decimalPlaces).toString()
}

export function formatBalance(balance: BigNumber, decimals: number, significant: number = decimals) {
    if (!BigNumber.isBigNumber(balance)) return '0'
    const negative = balance.isNegative() // balance < 0n
    const base = new BigNumber(10).pow(decimals) // 10n ** decimals

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
    return raw.indexOf('.') > -1 ? raw.replace(/0+$/, '').replace(/\.$/, '') : raw
}

export function formatCurrency(balance: number, sign: string = '$') {
    return `${sign}${balance.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, `${sign}&,`)}`
}

export function formatEthereumAddress(address: string, size = 0) {
    if (!EthereumAddress.isValid(address)) return address
    const address_ = EthereumAddress.checksumAddress(address)
    if (size === 0) return address_
    return `${address_.substr(0, 2 + size)}...${address_.substr(-size)}`
}

export function formatChecksumAddress(address: string) {
    return address && EthereumAddress.isValid(address) ? EthereumAddress.checksumAddress(address) : address
}

export function formatKeccakHash(hash: string, size = 0) {
    if (!/0x[\w\d]{64}/.test(hash)) return hash
    if (size === 0) return hash
    return `${hash.substr(0, 2 + size)}...${hash.substr(-size)}`
}

export function formatNumberString(str: string, size = 0) {
    if (!/\d+/.test(str)) return str
    if (size === 0) return str
    return `${str.substr(0, size)}...${str.substr(-size)}`
}
