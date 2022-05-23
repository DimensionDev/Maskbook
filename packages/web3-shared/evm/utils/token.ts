import type Web3 from 'web3'
import { AbiOutput, hexToBytes, toAscii } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { getEnumAsArray } from '@dimensiondev/kit'
import { getTokenConstants } from '../constants'
import {
    Asset,
    ChainId,
    CurrencyType,
    ERC1155TokenAssetDetailed,
    ERC721ContractDetailed,
    ERC721TokenInfo,
    ERC721TokenDetailed,
    ERC20TokenDetailed,
    EthereumTokenType,
    FungibleTokenDetailed,
    NativeTokenDetailed,
    ChainIdRecord,
} from '../types'
import { getChainDetailed, getChainIdFromName } from './chainDetailed'
import { formatBalance } from './formatter'
import { isSameAddress } from './address'
import CHAINS from '../assets/chains.json'

export function createNativeToken(chainId: ChainId): NativeTokenDetailed {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) throw new Error('Unknown chain id.')
    const { NATIVE_TOKEN_ADDRESS } = getTokenConstants(chainId)
    if (!NATIVE_TOKEN_ADDRESS) throw new Error('Failed to create token.')
    return {
        type: EthereumTokenType.Native,
        chainId,
        address: NATIVE_TOKEN_ADDRESS,
        ...chainDetailed.nativeCurrency,
    }
}

const NATIVE_TOKEN_SYMBOLS = CHAINS.filter((x) => x.network === 'mainnet' && x.nativeCurrency).map((x) =>
    x.nativeCurrency.symbol.toLowerCase(),
)
export function isNativeTokenSymbol(symbol: string) {
    return NATIVE_TOKEN_SYMBOLS.includes(symbol.toLowerCase())
}

export function createERC20Token(
    chainId: ChainId,
    address: string,
    decimals = 0,
    name = 'Unknown Token',
    symbol = 'UNKNOWN',
    logoURI?: string[],
): ERC20TokenDetailed {
    return {
        type: EthereumTokenType.ERC20,
        chainId,
        address,
        decimals,
        name,
        symbol,
        logoURI,
    }
}

export function createERC721ContractDetailed(
    chainId: ChainId,
    address: string,
    name = 'Unknown Token',
    symbol = 'UNKNOWN',
    baseURI?: string,
    iconURL?: string,
): ERC721ContractDetailed {
    return {
        type: EthereumTokenType.ERC721,
        chainId,
        address,
        name,
        symbol,
        baseURI,
        iconURL,
    }
}

export function createERC721Token(
    contractDetailed: ERC721ContractDetailed,
    info: ERC721TokenInfo,
    tokenId: string,
    collection?: {
        name: string
        image?: string
        slug: string
    },
): ERC721TokenDetailed {
    return {
        contractDetailed,
        info,
        tokenId,
        collection,
    }
}

export function createERC1155Token(
    chainId: ChainId,
    tokenId: string,
    address: string,
    name: string,
    uri?: string,
    asset?: ERC1155TokenAssetDetailed['asset'],
): ERC1155TokenAssetDetailed {
    return {
        type: EthereumTokenType.ERC1155,
        chainId,
        tokenId,
        address,
        name,
        uri,
        asset,
    }
}

export function createERC20Tokens(
    key: keyof ReturnType<typeof getTokenConstants>,
    name: string | ((chainId: ChainId) => string),
    symbol: string | ((chainId: ChainId) => string),
    decimals: number | ((chainId: ChainId) => number),
) {
    const entries = getEnumAsArray(ChainId).map(({ value: chainId }): [ChainId, ERC20TokenDetailed] => {
        const evaluator: <T>(f: T | ((chainId: ChainId) => T)) => T = (f) =>
            typeof f === 'function' ? (f as any)(chainId) : f
        return [
            chainId,
            {
                type: EthereumTokenType.ERC20,
                chainId,
                address: getTokenConstants(chainId)[key] ?? '',
                name: evaluator(name),
                symbol: evaluator(symbol),
                decimals: evaluator(decimals),
            },
        ]
    })
    return Object.fromEntries(entries) as ChainIdRecord<ERC20TokenDetailed>
}

export function addGasMargin(value: BigNumber.Value, scale = 3000) {
    return new BigNumber(value).multipliedBy(new BigNumber(10000).plus(scale)).dividedToIntegerBy(10000)
}

export function decodeOutputString(web3: Web3, abis: AbiOutput[], output: string) {
    if (abis.length === 1) return web3.eth.abi.decodeParameter(abis[0], output)
    if (abis.length > 1) return web3.eth.abi.decodeParameters(abis, output)
    return
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[\dA-Fa-f]{64}$/

export function parseStringOrBytes32(
    str: string | undefined,
    bytes32: string | undefined,
    defaultValue: string,
): string {
    return str && str.length > 0
        ? str
        : // need to check for proper bytes string and valid terminator
        bytes32 && BYTES32_REGEX.test(bytes32) && hexToBytes(bytes32)[31] === 0
        ? toAscii(bytes32)
        : defaultValue
}

// #region asset sort
export const getTokenUSDValue = (token: Asset) => (token.value ? Number.parseFloat(token.value[CurrencyType.USD]) : 0)
export const getBalanceValue = (asset: Asset) => Number.parseFloat(formatBalance(asset.balance, asset.token.decimals))
export const getTokenChainIdValue = (asset: Asset) =>
    asset.token.type === EthereumTokenType.Native ? 1 / asset.token.chainId : 0

export const makeSortTokenFn = (chainId: ChainId, options: { isMaskBoost?: boolean } = {}) => {
    const { isMaskBoost = false } = options
    const { MASK_ADDRESS } = getTokenConstants(chainId)

    return (a: FungibleTokenDetailed, b: FungibleTokenDetailed) => {
        // The native token goes first
        if (a.type === EthereumTokenType.Native) return -1
        if (b.type === EthereumTokenType.Native) return 1

        // The mask token second
        if (isMaskBoost) {
            if (isSameAddress(a.address, MASK_ADDRESS ?? '')) return -1
            if (isSameAddress(b.address, MASK_ADDRESS ?? '')) return 1
        }

        return 0
    }
}

export const makeSortAssertFn = (chainId: ChainId, options: { isMaskBoost?: boolean } = {}) => {
    const { isMaskBoost = false } = options
    const { MASK_ADDRESS } = getTokenConstants(chainId)

    return (a: Asset, b: Asset) => {
        // The tokens with the current chain id goes first
        if (a.chain !== b.chain) {
            if (getChainIdFromName(a.chain) === chainId) return -1
            if (getChainIdFromName(b.chain) === chainId) return 1
        }

        // native token sort
        const nativeTokenDifference = makeSortTokenFn(chainId, { isMaskBoost: false })(a.token, b.token)
        if (nativeTokenDifference !== 0) return nativeTokenDifference

        // Mask token at second if value > 0
        if (isMaskBoost) {
            if (isSameAddress(a.token.address, MASK_ADDRESS) && getBalanceValue(a) > 0) return -1
            if (isSameAddress(b.token.address, MASK_ADDRESS) && getBalanceValue(b) > 0) return 1
        }

        // Token with high usd value estimation has priority
        const valueDifference = getTokenUSDValue(b) - getTokenUSDValue(a)
        if (valueDifference !== 0) return valueDifference

        // Token with big balance has priority
        if (getBalanceValue(a) > getBalanceValue(b)) return -1
        if (getBalanceValue(a) < getBalanceValue(b)) return 1

        // mask token behind all valuable tokens if value = 0 and balance = 0
        if (isMaskBoost) {
            if (isSameAddress(a.token.address, MASK_ADDRESS)) return -1
            if (isSameAddress(b.token.address, MASK_ADDRESS)) return 1
        }

        // Sorted by alphabet
        if ((a.token.name ?? '') > (b.token.name ?? '')) return 1
        if ((a.token.name ?? '') < (b.token.name ?? '')) return -1

        return 0
    }
}

export const makeSortAssertWithoutChainFn = () => {
    return (a: Asset, b: Asset) => {
        // Token with high usd value estimation has priority
        const valueDifference = getTokenUSDValue(b) - getTokenUSDValue(a)
        if (valueDifference !== 0) return valueDifference

        // native token sort
        const chainValueDifference = getTokenChainIdValue(b) - getTokenChainIdValue(a)
        if (chainValueDifference !== 0) return chainValueDifference

        // Token with big balance has priority
        if (getBalanceValue(a) > getBalanceValue(b)) return -1
        if (getBalanceValue(a) < getBalanceValue(b)) return 1

        // Sorted by alphabet
        if ((a.token.name ?? '') > (b.token.name ?? '')) return 1
        if ((a.token.name ?? '') < (b.token.name ?? '')) return -1

        return 0
    }
}
// #endregion
