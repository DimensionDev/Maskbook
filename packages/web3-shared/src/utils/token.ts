import { getEnumAsArray } from '@dimensiondev/maskbook-shared'
import { TOKEN_CONSTANTS } from '../constants'
import {
    ChainId,
    ERC1155TokenAssetDetailed,
    ERC20TokenDetailed,
    ERC721TokenAssetDetailed,
    EthereumTokenType,
    NativeTokenDetailed,
} from '../types'
import { constantOfChain } from './constant'
import { getChainDetailed } from './chain'

//#region tokens
export function createNativeToken(chainId: ChainId): NativeTokenDetailed {
    const chainDetailed = getChainDetailed(chainId)
    if (!chainDetailed) throw new Error('Unknown chain id.')
    return {
        type: EthereumTokenType.Native,
        chainId,
        address: constantOfChain(TOKEN_CONSTANTS).NATIVE_TOKEN_ADDRESS,
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
    key: keyof typeof TOKEN_CONSTANTS,
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
            address: constantOfChain(TOKEN_CONSTANTS, chainId)[key] as string,
            name: evaludator(name),
            symbol: evaludator(symbol),
            decimals: evaludator(decimals),
        }
        return accumulator
    }, {} as { [chainId in ChainId]: ERC20TokenDetailed })
}
//#endregion
