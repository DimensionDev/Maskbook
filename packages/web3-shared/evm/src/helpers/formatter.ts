import { BigNumber } from 'bignumber.js'
import { EthereumAddress } from 'wallet.ts'
import { createLookupTableResolver } from '@masknet/shared-base'
import { isValidDomain } from './domain.js'
import { isValidAddress } from './address.js'
import { SchemaType } from '../types/index.js'

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

export const formatSchemaType = createLookupTableResolver<SchemaType, string>(
    {
        [SchemaType.Native]: 'Native',
        [SchemaType.ERC20]: 'ERC20',
        [SchemaType.ERC721]: 'ERC721',
        [SchemaType.ERC1155]: 'ERC1155',
        [SchemaType.SBT]: 'SBT',
    },
    '',
)

export function formatTokenId(tokenId = '', size_ = 4) {
    const size = Math.max(2, size_)
    const isHex = tokenId.toLowerCase().startsWith('0x')
    const prefix = isHex ? '0x' : '#'
    if (tokenId.length < size * 2 + prefix.length) return `#${tokenId}`
    const head = tokenId.slice(0, isHex ? 2 + size : size)
    const tail = tokenId.slice(-size)
    return `${prefix}${head}...${tail}`
}

export function formatDomainName(domain: string, size = 18) {
    if (!domain || !isValidDomain(domain)) return domain
    if (domain.length <= size) return domain
    const name = domain.split('.')[0]
    // xxx.yyy.eth
    const suffix = domain.split('.').pop()

    return `${name.slice(0, size - 6)}...${name.slice(-2)}.${suffix}`
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

export function formatEtherToGwei(value: BigNumber.Value) {
    return new BigNumber(value).shiftedBy(9).integerValue()
}

export function formatGweiToEther(value: BigNumber.Value) {
    return new BigNumber(value).shiftedBy(-9)
}

/**
 * @deprecated use formatCurrency stead
 * @param value
 * @param significant
 * @returns
 */
export function formatUSD(value: BigNumber.Value, significant = 2): string {
    const bn = new BigNumber(value)
    return bn.lt(0.01) ? '<$0.01' : bn.toFixed(significant)
}
