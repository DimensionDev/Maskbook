import { BigNumber } from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'

export function formatBalance(balance: BigNumber, decimals: number, precision: number) {
    if (!BigNumber.isBigNumber(balance)) return
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
