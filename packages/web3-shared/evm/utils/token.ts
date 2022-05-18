import {
    createFungibleToken,
    createFungibleTokensFromConstants,
    createNonFungibleToken,
    NonFungibleToken,
    NonFungibleTokenCollection,
    NonFungibleTokenContract,
    NonFungibleTokenMetadata,
} from '@masknet/web3-shared-base'
import Token from '@masknet/web3-constants/evm/token.json'
import { chainResolver } from '.'
import { CHAIN_DESCRIPTORS, getTokenConstants, ZERO_ADDRESS } from '../constants'
import { ChainId, SchemaType } from '../types'
import { getEnumAsArray } from '@dimensiondev/kit'

export function isNativeTokenSymbol(symbol: string) {
    return CHAIN_DESCRIPTORS.filter((x) => x.network === 'mainnet' && x.nativeCurrency)
        .map((x) => x.nativeCurrency.symbol.toLowerCase())
        .includes(symbol.toLowerCase())
}

export function createNativeToken(chainId: ChainId) {
    const nativeCurrency = chainResolver.nativeCurrency(chainId)
    return createFungibleToken<ChainId, SchemaType.Native>(
        chainId,
        SchemaType.Native,
        getTokenConstants(chainId).NATIVE_TOKEN_ADDRESS ?? ZERO_ADDRESS,
        nativeCurrency?.name ?? 'Ether',
        nativeCurrency?.symbol ?? 'ETH',
        nativeCurrency?.decimals ?? 18,
        nativeCurrency?.logoURL as string | undefined,
    )
}

export function createERC20Token(
    chainId: ChainId,
    address: string,
    name = 'Unknown Token',
    symbol = '',
    decimals = 0,
    logoURI?: string,
) {
    return createFungibleToken<ChainId, SchemaType.ERC20>(
        chainId,
        SchemaType.ERC20,
        address,
        name,
        symbol,
        decimals,
        logoURI,
    )
}

export const createERC20Tokens = createFungibleTokensFromConstants(getEnumAsArray(ChainId), SchemaType.ERC20, Token)

export function createERC721Token(
    chainId: ChainId,
    address: string,
    tokenId: string,
    metadata?: NonFungibleTokenMetadata<ChainId>,
    contract?: NonFungibleTokenContract<ChainId, SchemaType.ERC721>,
    collection?: NonFungibleTokenCollection<ChainId>,
) {
    return createNonFungibleToken(chainId, SchemaType.ERC721, address, tokenId, metadata, contract, collection)
}

export function createERC721Contract(
    chainId: ChainId,
    address: string,
    name: string,
    symbol: string,
    owner?: string,
    balance?: number,
    logoURL?: string,
): NonFungibleTokenContract<ChainId, SchemaType.ERC721> {
    return {
        chainId,
        schema: SchemaType.ERC721,
        address,
        name,
        symbol,
        owner,
        balance,
        logoURL,
    }
}

export function createERC721Metadata(
    chainId: ChainId,
    name: string,
    symbol: string,
    description?: string,
    imageURL?: string,
    mediaURL?: string,
    mediaType?: string,
): NonFungibleTokenMetadata<ChainId> {
    return {
        chainId,
        name,
        symbol,
        description,
        imageURL,
        mediaURL,
        mediaType,
    }
}

export function createERC721Collection(
    chainId: ChainId,
    name: string,
    slug: string,
    description?: string,
    iconURL?: string,
    verified?: boolean,
    createdAt?: number,
): NonFungibleTokenCollection<ChainId> {
    return {
        chainId,
        name,
        slug,
        description,
        iconURL,
        verified,
        createdAt,
    }
}

export function createERC1155Token(
    chainId: ChainId,
    address: string,
    tokenId: string,
    metadata?: NonFungibleToken<ChainId, SchemaType.ERC1155>['metadata'],
    contract?: NonFungibleToken<ChainId, SchemaType.ERC1155>['contract'],
    collection?: NonFungibleToken<ChainId, SchemaType.ERC1155>['collection'],
) {
    return createNonFungibleToken(chainId, SchemaType.ERC1155, address, tokenId, metadata, contract, collection)
}
