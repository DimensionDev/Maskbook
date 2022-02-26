import type Web3 from 'web3'
import { AbiOutput, hexToBytes, toAscii } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { getEnumAsArray } from '@dimensiondev/kit'
import { CurrencyType, TokenType, Web3Plugin } from '@masknet/plugin-infra'
import { getTokenConstants } from '../constants'
import { ChainId, EthereumTokenType, ChainIdRecord } from '../types'
import { getChainDetailed } from './chainDetailed'
import { formatBalance } from './formatter'
import { isSameAddress } from './address'
import CHAINS from '../assets/chains.json'

export function createNativeToken(chainId: ChainId): Web3Plugin.FungibleToken {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) throw new Error('Unknown chain id.')

    const { NATIVE_TOKEN_ADDRESS } = getTokenConstants(chainId)
    if (!NATIVE_TOKEN_ADDRESS) throw new Error('Failed to create token.')

    return {
        id: NATIVE_TOKEN_ADDRESS,
        type: TokenType.Fungible,
        subType: EthereumTokenType.Native,
        chainId,
        address: NATIVE_TOKEN_ADDRESS,
        ...chainDetailed.nativeCurrency,
    }
}

export function isNativeTokenSymbol(symbol: string) {
    return CHAINS.filter((x) => x.network === 'mainnet' && x.nativeCurrency)
        .map((x) => x.nativeCurrency.symbol.toLowerCase())
        .includes(symbol.toLowerCase())
}

export function createERC20Token(
    chainId: ChainId,
    address: string,
    decimals = 0,
    name = 'Unknown Token',
    symbol = 'UNKNOWN',
    logoURI?: string[],
): Web3Plugin.FungibleToken {
    return {
        id: address,
        type: TokenType.Fungible,
        subType: EthereumTokenType.ERC20,
        chainId,
        address,
        decimals,
        name,
        symbol,
        logoURI,
    }
}

export function createERC721Contract(
    chainId: ChainId,
    address: string,
    name = 'Unknown Token',
    symbol = 'UNKNOWN',
    baseURI?: string,
    iconURL?: string,
): Web3Plugin.NonFungibleToken['contract'] {
    return {
        type: EthereumTokenType.ERC721,
        address,
        chainId,
        name,
        symbol,
        baseURI,
        iconURL,
    }
}

export function createERC721Token(
    chainId: ChainId,
    address: string,
    tokenId: string,
    contract: Web3Plugin.NonFungibleToken['contract'],
    metadata: Web3Plugin.NonFungibleToken['metadata'],
    collection?: Web3Plugin.NonFungibleToken['collection'],
): Web3Plugin.NonFungibleToken {
    return {
        id: address,
        type: TokenType.NonFungible,
        subType: EthereumTokenType.ERC721,
        chainId,
        tokenId,
        address,
        contract,
        metadata,
        collection,
    }
}

export function createERC1155Token(
    chainId: ChainId,
    address: string,
    tokenId: string,
    contract: Web3Plugin.NonFungibleToken['contract'],
    metadata: Web3Plugin.NonFungibleToken['metadata'],
    collection?: Web3Plugin.NonFungibleToken['collection'],
): Web3Plugin.NonFungibleToken {
    return {
        id: address,
        type: TokenType.NonFungible,
        subType: EthereumTokenType.ERC1155,
        chainId,
        tokenId,
        address,
        contract,
        metadata,
        collection,
    }
}

export function createERC20Tokens(
    key: keyof ReturnType<typeof getTokenConstants>,
    name: string | ((chainId: ChainId) => string),
    symbol: string | ((chainId: ChainId) => string),
    decimals: number | ((chainId: ChainId) => number),
) {
    type Table = ChainIdRecord<Web3Plugin.FungibleToken>
    const base = {} as Table
    return getEnumAsArray(ChainId).reduce<Table>((accumulator, { value: chainId }) => {
        const evaluator: <T>(f: T | ((chainId: ChainId) => T)) => T = (f) =>
            typeof f === 'function' ? (f as any)(chainId) : f

        accumulator[chainId] = {
            id: getTokenConstants(chainId)[key] ?? '',
            type: TokenType.Fungible,
            subType: EthereumTokenType.ERC20,
            chainId,
            address: getTokenConstants(chainId)[key] ?? '',
            name: evaluator(name),
            symbol: evaluator(symbol),
            decimals: evaluator(decimals),
        }
        return accumulator
    }, base)
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
export const getTokenUSDValue = (asset: Web3Plugin.FungibleAsset) =>
    asset.value ? Number.parseFloat(asset.value[CurrencyType.USD] ?? '0') : 0
export const getBalanceValue = (asset: Web3Plugin.FungibleAsset) =>
    Number.parseFloat(formatBalance(asset.balance, asset.decimals))
export const getTokenChainIdValue = (asset: Web3Plugin.FungibleAsset) =>
    asset.subType === EthereumTokenType.Native ? 1 / asset.chainId : 0

export const makeSortTokenFn = (chainId: ChainId, options: { isMaskBoost?: boolean } = {}) => {
    const { isMaskBoost = false } = options
    const { MASK_ADDRESS } = getTokenConstants(chainId)

    return (a: Web3Plugin.FungibleToken, b: Web3Plugin.FungibleToken) => {
        // The native token goes first
        if (a.subType === EthereumTokenType.Native) return -1
        if (b.subType === EthereumTokenType.Native) return 1

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

    return (a: Web3Plugin.FungibleAsset, b: Web3Plugin.FungibleAsset) => {
        // The tokens with the current chain id goes first
        if (a.chainId !== b.chainId) {
            if (a.chainId === chainId) return -1
            if (b.chainId === chainId) return 1
        }

        // native token sort
        const nativeTokenDifference = makeSortTokenFn(chainId, { isMaskBoost: false })(a, b)
        if (nativeTokenDifference !== 0) return nativeTokenDifference

        // Mask token at second if value > 0
        if (isMaskBoost) {
            if (isSameAddress(a.address, MASK_ADDRESS) && getBalanceValue(a) > 0) return -1
            if (isSameAddress(b.address, MASK_ADDRESS) && getBalanceValue(b) > 0) return 1
        }

        // Token with high usd value estimation has priority
        const valueDifference = getTokenUSDValue(b) - getTokenUSDValue(a)
        if (valueDifference !== 0) return valueDifference

        // Token with big balance has priority
        if (getBalanceValue(a) > getBalanceValue(b)) return -1
        if (getBalanceValue(a) < getBalanceValue(b)) return 1

        // mask token behind all valuable tokens if value = 0 and balance = 0
        if (isMaskBoost) {
            if (isSameAddress(a.address, MASK_ADDRESS)) return -1
            if (isSameAddress(b.address, MASK_ADDRESS)) return 1
        }

        // Sorted by alphabet
        if ((a.name ?? '') > (b.name ?? '')) return 1
        if ((a.name ?? '') < (b.name ?? '')) return -1

        return 0
    }
}

export const makeSortAssertWithoutChainFn = () => {
    return (a: Web3Plugin.FungibleAsset, b: Web3Plugin.FungibleAsset) => {
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
        if ((a.name ?? '') > (b.name ?? '')) return 1
        if ((a.name ?? '') < (b.name ?? '')) return -1

        return 0
    }
}
// #endregion
