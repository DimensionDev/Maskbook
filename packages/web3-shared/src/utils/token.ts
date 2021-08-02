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
    ERC20TokenDetailed,
    ERC721TokenAssetDetailed,
    EthereumTokenType,
    FungibleTokenDetailed,
    NativeTokenDetailed,
} from '../types'
import { getChainDetailed, getChainIdFromName } from './chainDetailed'
import { formatBalance } from './formatter'
import { isSameAddress } from './address'

export function createNativeToken(chainId: ChainId): NativeTokenDetailed {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) throw new Error('Unknown chain id.')
    const { NATIVE_TOKEN_ADDRESS } = getTokenConstants()
    if (!NATIVE_TOKEN_ADDRESS) throw new Error('Failed to create token.')
    return {
        type: EthereumTokenType.Native,
        chainId,
        address: NATIVE_TOKEN_ADDRESS,
        ...chainDetailed.nativeCurrency,
    }
}

export function createERC20Token(
    chainId: ChainId,
    address: string,
    decimals: number,
    name: string,
    symbol: string,
): ERC20TokenDetailed {
    return {
        type: EthereumTokenType.ERC20,
        chainId,
        address,
        decimals,
        name,
        symbol,
    }
}

export function createERC721Token(
    chainId: ChainId,
    tokenId: string,
    address: string,
    name: string,
    symbol: string,
    baseURI?: string,
    tokenURI?: string,
    asset?: ERC721TokenAssetDetailed['asset'],
): ERC721TokenAssetDetailed {
    return {
        type: EthereumTokenType.ERC721,
        chainId,
        tokenId,
        address,
        name,
        symbol,
        baseURI,
        tokenURI,
        asset,
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
    return getEnumAsArray(ChainId).reduce((accumulator, { value: chainId }) => {
        const evaludator: <T>(f: T | ((chainId: ChainId) => T)) => T = (f) =>
            typeof f === 'function' ? (f as any)(chainId) : f

        accumulator[chainId] = {
            type: EthereumTokenType.ERC20,
            chainId,
            address: getTokenConstants(chainId)[key] ?? '',
            name: evaludator(name),
            symbol: evaludator(symbol),
            decimals: evaludator(decimals),
        }
        return accumulator
    }, {} as { [chainId in ChainId]: ERC20TokenDetailed })
}
//#endregion

export function addGasMargin(value: BigNumber.Value, scale = 3000) {
    return new BigNumber(value).multipliedBy(new BigNumber(10000).plus(scale)).dividedToIntegerBy(10000)
}

export function decodeOutputString(web3: Web3, abis: AbiOutput[], output: string) {
    if (abis.length === 1) return web3.eth.abi.decodeParameter(abis[0], output)
    if (abis.length > 1) return web3.eth.abi.decodeParameters(abis, output)
    return
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/

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

//#region asset sort
const { MASK_ADDRESS } = getTokenConstants()

export const getTokenUSDValue = (token: Asset) => (token.value ? Number.parseFloat(token.value[CurrencyType.USD]) : 0)
export const getBalanceValue = (asset: Asset) => parseFloat(formatBalance(asset.balance, asset.token.decimals))

export const makeSortTokenFn =
    (options = { isMaskBoost: false }) =>
    (a: FungibleTokenDetailed, b: FungibleTokenDetailed) => {
        // The native token goes first
        if (a.type === EthereumTokenType.Native) return -1
        if (b.type === EthereumTokenType.Native) return 1

        // The mask token second
        if (options.isMaskBoost) {
            if (isSameAddress(a.address, MASK_ADDRESS ?? '')) return -1
            if (isSameAddress(b.address, MASK_ADDRESS ?? '')) return 1
        }

        return 0
    }

export const makeSortAssertFn =
    (chainId: ChainId, options = { isMaskBoost: false }) =>
    (a: Asset, b: Asset) => {
        // The tokens with the current chain id goes first
        if (a.chain !== b.chain) {
            if (getChainIdFromName(a.chain) === chainId) return -1
            if (getChainIdFromName(b.chain) === chainId) return 1
        }

        // token sort
        const tokenDifference = makeSortTokenFn({ isMaskBoost: options.isMaskBoost })(a.token, b.token)
        if (tokenDifference !== 0) return tokenDifference

        // Token with high usd value estimation has priority
        const valueDifference = getTokenUSDValue(b) - getTokenUSDValue(a)
        if (valueDifference !== 0) return valueDifference

        // Token with big balance has priority
        if (getBalanceValue(a) > getBalanceValue(b)) return -1
        if (getBalanceValue(a) < getBalanceValue(b)) return 1

        // Sorted by alphabet
        if (a.balance > b.balance) return -1
        if (a.balance < b.balance) return 1

        return 0
    }
//#endregion
