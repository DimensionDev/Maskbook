import { BigNumber } from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
import { multipliedBy, pow10 } from '@masknet/web3-shared-base'
import { isValidDomain } from './domain'

export function formatPercentage(value: BigNumber.Value) {
    const percentage = multipliedBy(value, 100)
        .toFixed(2)
        .replace(/\.?0+$/, '')
    return `${percentage}%`
}

export function formatPrice(price: BigNumber.Value, decimalPlaces = 6) {
    return new BigNumber(price).decimalPlaces(decimalPlaces).toString()
}

export function formatAmount(amount: BigNumber.Value = '0', decimals = 0) {
    return new BigNumber(amount).shiftedBy(decimals).toFixed()
}

export function formatBalance(rawValue: BigNumber.Value = '0', decimals = 0, significant = decimals) {
    let balance = new BigNumber(rawValue)
    if (balance.isNaN()) return '0'
    const negative = balance.isNegative() // balance < 0n
    const base = pow10(decimals) // 10n ** decimals

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

export function formatCurrency(value: BigNumber.Value, sign = '') {
    const balance = new BigNumber(value)
    const fixedBalance = balance.gt(1) ? balance.toFixed(2) : balance.toPrecision(2)
    return `${sign}${fixedBalance.replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
}

export function formatEthereumAddress(address: string, size = 0) {
    if (!EthereumAddress.isValid(address)) return address
    const address_ = EthereumAddress.checksumAddress(address)
    if (size === 0 || size >= 20) return address_
    return `${address_.substr(0, 2 + size)}...${address_.substr(-size)}`
}

export function formatNFT_TokenId(tokenId: string, size = 0) {
    if (tokenId.length < 9) return `#${tokenId}`
    return `#${tokenId.substr(0, 2 + size)}...${tokenId.substr(-size)}`
}

export function formatDomainName(domain?: string, size = 4) {
    if (!domain || !isValidDomain(domain)) return domain
    const [domainName, company] = domain.split('.')
    if (domainName.length < 13) return domain

    return `${domainName.substr(0, size)}...${domainName.substr(-size)}.${company}`
}

export function formatKeccakHash(hash: string, size = 0) {
    if (!/0x\w{64}/.test(hash)) return hash
    if (size === 0) return hash
    return `${hash.substr(0, 2 + size)}...${hash.substr(-size)}`
}

export function formatNumberString(str: string, size = 0) {
    if (!/\d+/.test(str)) return str
    if (size === 0) return str
    return `${str.substr(0, size)}...${str.substr(-size)}`
}

export function formatWeiToGwei(value: BigNumber.Value) {
    return new BigNumber(value).shiftedBy(-9).integerValue()
}

export function formatWeiToEther(value: BigNumber.Value) {
    return new BigNumber(value).shiftedBy(-18)
}

export function formatGweiToWei(value: BigNumber.Value) {
    return new BigNumber(value).shiftedBy(9)
}

export function formatGweiToEther(value: BigNumber.Value) {
    return new BigNumber(value).shiftedBy(-9)
}

export function formatUSD(value: BigNumber.Value, significant = 2): string {
    const bn = new BigNumber(value)
    return bn.lt(0.01) ? '<$0.01' : bn.toFixed(significant)
}
