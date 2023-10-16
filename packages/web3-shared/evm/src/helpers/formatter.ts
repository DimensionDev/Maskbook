import { createLookupTableResolver } from '@masknet/shared-base'
import { isZero, type NonFungibleTokenTrait } from '@masknet/web3-shared-base'
import { BigNumber } from 'bignumber.js'
import { memoize } from 'lodash-es'
import { format as formatDateTime } from 'date-fns'
import { SchemaType } from '../types/index.js'
import { checksumAddress, isValidAddress } from './address.js'
import { isEnsSubdomain, isValidDomain } from './isValidDomain.js'

export function formatAmount(amount: BigNumber.Value = '0', decimals = 0) {
    return new BigNumber(amount).shiftedBy(decimals).toFixed()
}

export const formatEthereumAddress: (address: string, size?: number) => string = memoize(
    function formatEthereumAddress(address: string, size = 0) {
        if (!isValidAddress(address)) return address
        const address_ = checksumAddress(address)
        if (size === 0 || size >= 20) return address_
        return `${address_.slice(0, Math.max(0, 2 + size))}...${address_.slice(-size)}`
    },
    (addr, size) => `${addr}.${size}`,
)

/**
 * timestamp in seconds or milliseconds
 */
const formatTimestamp = (timestamp: string) => {
    const value = Number.parseInt(timestamp, 10) * (timestamp.length === 10 ? 1000 : 1)
    return formatDateTime(new Date(value), 'yyyy-MM-dd HH:mm')
}
export function formatTrait(trait: NonFungibleTokenTrait) {
    if (isValidAddress(trait.value)) return formatEthereumAddress(trait.value, 4)
    if (trait.displayType === 'date') return formatTimestamp(trait.value)
    return trait.value
}

export function formatHash(hash: string, size = 0) {
    if (size === 0) return hash
    return `${hash.slice(0, Math.max(0, 2 + size))}...${hash.slice(-size)}`
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

export function formatDomainName(domain: string, size = 18, invalidIgnore?: boolean) {
    if (!domain) return domain
    if (!isValidDomain(domain) && !invalidIgnore) {
        return domain
    }
    if (domain.length <= size) return domain

    if (isEnsSubdomain(domain)) {
        return domain.replace(/^\[([^\]]+?)]\.(.*)$/, (_, hash, mainName): string => {
            return `[${hash.slice(0, 4)}...${hash.slice(-4)}].${formatDomainName(mainName, size, invalidIgnore)}`
        })
    }

    return domain.replace(/^(.*)\.(\w+)$/, (_, name, suffix): string => {
        return `${name.slice(0, size - 6)}...${name.slice(-2)}.${suffix}`
    })
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

export function formatGas(value?: BigNumber.Value) {
    if (!value || isZero(value)) return ''
    const gwei = formatWeiToGwei(value)
    if (gwei.lt('0.01')) return '<0.01 Gwei'
    return `${gwei.toFixed(2)} Gwei`
}

export function formatEtherToWei(value: BigNumber.Value) {
    return new BigNumber(value).shiftedBy(18).integerValue()
}

export function formatGweiToEther(value: BigNumber.Value) {
    return new BigNumber(value).shiftedBy(-9)
}
