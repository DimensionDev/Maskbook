import type Web3 from 'web3'
import type { AbiOutput } from 'web3-utils'
import BigNumber from 'bignumber.js'
import type { Web3Constants } from '@dimensiondev/web3-shared'
import { isSameAddress } from '@dimensiondev/web3-shared'

import { CONSTANTS } from './constants'
import {
    ChainId,
    ERC20TokenDetailed,
    EthereumTokenType,
    NativeTokenDetailed,
    ERC721TokenAssetDetailed,
    ERC1155TokenAssetDetailed,
} from './types'
import { resolveChainDetailed } from './pipes'

export { isSameAddress } from '@dimensiondev/web3-shared'

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

export function createNativeToken(chainId: ChainId): NativeTokenDetailed {
    const chainDetailed = resolveChainDetailed(chainId)
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

export function decodeOutputString(web3: Web3, abis: AbiOutput[], output: string) {
    if (abis.length === 1) return web3.eth.abi.decodeParameter(abis[0], output)
    if (abis.length > 1) return web3.eth.abi.decodeParameters(abis, output)
    return
}
