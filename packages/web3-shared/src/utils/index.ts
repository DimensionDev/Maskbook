import BigNumber from 'bignumber.js'
import CHAINS from '../assets/chains.json'
import { CONSTANTS } from '../constants'
import {
    ChainId,
    ERC1155TokenAssetDetailed,
    ERC20TokenDetailed,
    ERC721TokenAssetDetailed,
    EthereumTokenType,
    NativeTokenDetailed,
    NetworkType,
    Web3Constants,
} from '../types'

export function isSameAddress(addrA: string, addrB: string) {
    return addrA.toLowerCase() === addrB.toLowerCase()
}

export function isDAI(address: string) {
    return isSameAddress(address, getConstant(CONSTANTS, 'DAI_ADDRESS'))
}

export function isOKB(address: string) {
    return isSameAddress(address, getConstant(CONSTANTS, 'OBK_ADDRESS'))
}

export function isNative(address: string) {
    return isSameAddress(address, getConstant(CONSTANTS, 'NATIVE_TOKEN_ADDRESS'))
}

export function addGasMargin(value: BigNumber.Value, scale = 1000) {
    return new BigNumber(value).multipliedBy(new BigNumber(10000).plus(scale)).dividedToIntegerBy(10000)
}

//#region constants

/**
 * @deprecated Use constantOfChain from @dimensiondev/web3-shared package
 *
 * Before: `getConstant(T, "a", ChainId.Mainnet)`
 *
 * After: `constantOfChain(T, ChainId.Mainnet).a`
 */
export function getConstant<T extends Web3Constants, K extends keyof T>(
    constants: T,
    key: K,
    chainId = ChainId.Mainnet,
): T[K][ChainId.Mainnet] {
    return constants[key][chainId]
}
//#endregion

//#region chain detailed
export function getChainDetailed(chainId: ChainId = ChainId.Mainnet) {
    return CHAINS.find((x) => x.chainId === chainId)
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
        [x.chain, x.network, x.shortName, x.fullName].map((y) => y.toLowerCase()).includes(name.toLowerCase()),
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
        address: getConstant(CONSTANTS, 'NATIVE_TOKEN_ADDRESS'),
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
//#endregion

import type Web3 from 'web3'
import type { AbiOutput } from 'web3-utils'
import { safeUnreachable } from '@dimensiondev/maskbook-shared'

export function decodeOutputString(web3: Web3, abis: AbiOutput[], output: string) {
    if (abis.length === 1) return web3.eth.abi.decodeParameter(abis[0], output)
    if (abis.length > 1) return web3.eth.abi.decodeParameters(abis, output)
    return
}
