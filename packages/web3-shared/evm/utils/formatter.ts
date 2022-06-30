import { BigNumber } from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
import { isValidDomain } from './domain'
import { isValidAddress } from './address'

export { formatPercentage } from '@masknet/web3-shared-base'

export function formatPrice(price: BigNumber.Value, decimalPlaces = 6) {
    return new BigNumber(price).decimalPlaces(decimalPlaces).toString()
}

export function formatAmount(amount: BigNumber.Value = '0', decimals = 0) {
    return new BigNumber(amount).shiftedBy(decimals).toFixed()
}

export function formatEthereumAddress(address: string, size = 0) {
    if (!isValidAddress(address)) return address
    const address_ = EthereumAddress.checksumAddress(address)
    if (size === 0 || size >= 20) return address_
    return `${address_.slice(0, Math.max(0, 2 + size))}...${address_.slice(-size)}`
}

export function formatTokenId(tokenId: string, size = 0) {
    if (tokenId.length < 9) return `#${tokenId}`
    return `#${tokenId.slice(0, Math.max(0, 2 + size))}...${tokenId.slice(-size)}`
}

export function formatDomainName(domain: string, size = 4) {
    if (!domain || !isValidDomain(domain)) return domain
    const [domainName, company] = domain.split('.')
    if (domainName.length < 13) return domain

    return `${domainName.slice(0, Math.max(0, size))}...${domainName.slice(-size)}.${company}`
}

export function formatKeccakHash(hash: string, size = 0) {
    if (!/0x\w{64}/.test(hash)) return hash
    if (size === 0) return hash
    return `${hash.slice(0, Math.max(0, 2 + size))}...${hash.slice(-size)}`
}

export function formatNumberString(input: string, size = 0) {
    if (!/\d+/.test(input)) return input
    if (size === 0) return input
    return `${input.slice(0, Math.max(0, size))}...${input.slice(-size)}`
}

export function formatWeiToGwei(value: BigNumber.Value) {
    return new BigNumber(value).shiftedBy(-9)
}

export function formatWeiToEther(value: BigNumber.Value) {
    return new BigNumber(value).shiftedBy(-18)
}

export function formatGweiToWei(value: BigNumber.Value) {
    return new BigNumber(value).shiftedBy(9).integerValue()
}

export function formatGweiToEther(value: BigNumber.Value) {
    return new BigNumber(value).shiftedBy(-9)
}

export function formatUSD(value: BigNumber.Value, significant = 2): string {
    const bn = new BigNumber(value)
    return bn.lt(0.01) ? '<$0.01' : bn.toFixed(significant)
}
