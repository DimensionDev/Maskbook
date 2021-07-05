import { getEnumAsArray, safeUnreachable } from '@dimensiondev/kit'
import BigNumber from 'bignumber.js'
import type Web3 from 'web3'
import { AbiOutput, hexToBytes, toAscii } from 'web3-utils'
import CHAINS from '../assets/chains.json'
import { getTokenConstants } from '../constants'
import {
    Asset,
    ChainId,
    CurrencyType,
    ERC1155TokenAssetDetailed,
    ERC20TokenDetailed,
    ERC721TokenAssetDetailed,
    EthereumTokenType,
    NativeTokenDetailed,
    NetworkType,
} from '../types'

export function isSameAddress(addrA: string, addrB: string) {
    return addrA.toLowerCase() === addrB.toLowerCase()
}

export function currySameAddress(base: string) {
    return (target: string | { address: string }) => {
        if (typeof target === 'string') {
            return isSameAddress(base, target)
        } else if (typeof target === 'object' && typeof target.address === 'string') {
            return isSameAddress(base, target.address)
        }
        throw new Error('Unsupported `target` address format')
    }
}

export const isDAI = currySameAddress(getTokenConstants().DAI_ADDRESS)

export const isOKB = currySameAddress(getTokenConstants().OKB_ADDRESS)

export const isNative = currySameAddress(getTokenConstants().NATIVE_TOKEN_ADDRESS)

export function addGasMargin(value: BigNumber.Value, scale = 3000) {
    return new BigNumber(value).multipliedBy(new BigNumber(10000).plus(scale)).dividedToIntegerBy(10000)
}

//#region chain detailed
export function getChainDetailed(chainId = ChainId.Mainnet) {
    return CHAINS.find((x) => x.chainId === chainId)
}

// Learn more: https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md
export function getChainDetailedCAIP(chainId = ChainId.Mainnet) {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) return
    return {
        chainId: `0x${chainDetailed.chainId.toString(16)}`,
        chainName: chainDetailed.name,
        nativeCurrency: chainDetailed.nativeCurrency,
        rpcUrls: chainDetailed.rpc,
        blockExplorerUrls: [
            chainDetailed.explorers && chainDetailed.explorers.length > 0 && chainDetailed.explorers[0].url
                ? chainDetailed.explorers[0].url
                : chainDetailed.infoURL,
        ],
    }
}

export function getChainName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.name ?? 'Unknown'
}

export function getChainFullName(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    return chainDetailed?.fullName ?? 'Unknown'
}

export function getChainIdFromName(name: string) {
    const chainDetailed = CHAINS.find((x) =>
        [x.chain, x.network, x.name, x.shortName, x.fullName].map((y) => y.toLowerCase()).includes(name.toLowerCase()),
    )
    return chainDetailed?.chainId as ChainId | undefined
}

export function getChainIdFromNetworkType(networkType: NetworkType) {
    switch (networkType) {
        case NetworkType.Ethereum:
            return ChainId.Mainnet
        case NetworkType.Binance:
            return ChainId.BSC
        case NetworkType.Polygon:
            return ChainId.Matic
        default:
            safeUnreachable(networkType)
            return ChainId.Mainnet
    }
}

export function getNetworkTypeFromChainId(chainId: ChainId) {
    const chainDetailed = getChainDetailed(chainId)
    switch (chainDetailed?.chain) {
        case 'ETH':
            return NetworkType.Ethereum
        case 'BSC':
            return NetworkType.Binance
        case 'Matic':
            return NetworkType.Polygon
        default:
            throw new Error('Unknown chain id.')
    }
}
//#endregion

//#region tokens
export function createNativeToken(chainId: ChainId): NativeTokenDetailed {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) throw new Error('Unknown chain id.')
    return {
        type: EthereumTokenType.Native,
        chainId,
        address: getTokenConstants().NATIVE_TOKEN_ADDRESS,
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
            address: getTokenConstants(chainId)[key],
            name: evaludator(name),
            symbol: evaludator(symbol),
            decimals: evaludator(decimals),
        }
        return accumulator
    }, {} as { [chainId in ChainId]: ERC20TokenDetailed })
}
//#endregion

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

export const getTokenUSDValue = (token: Asset) => (token.value ? Number.parseFloat(token.value[CurrencyType.USD]) : 0)
