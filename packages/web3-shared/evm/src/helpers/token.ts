import { getEnumAsArray } from '@masknet/kit'
import { createFungibleToken, createFungibleTokensFromConstants } from '@masknet/web3-shared-base'
import Token from '@masknet/web3-constants/evm/token.json' with { type: 'json' }
import { CHAIN_DESCRIPTORS } from '../constants/index.js'
import { ChainId, SchemaType } from '../types/index.js'

export function isNativeTokenSymbol(symbol: string) {
    return CHAIN_DESCRIPTORS.filter((x) => x.network === 'mainnet' && x.nativeCurrency)
        .map((x) => x.nativeCurrency.symbol.toLowerCase())
        .includes(symbol.toLowerCase())
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

export const createERC20Tokens = createFungibleTokensFromConstants<typeof Token, ChainId, SchemaType.ERC20>(
    getEnumAsArray(ChainId),
    SchemaType.ERC20,
    Token,
)

export function isNativeTokenSchemaType(schemaType?: SchemaType) {
    return schemaType === SchemaType.Native
}

export function isFungibleTokenSchemaType(schemaType?: SchemaType) {
    return schemaType === SchemaType.Native || schemaType === SchemaType.ERC20
}

export function isNonFungibleTokenSchemaType(schemaType?: SchemaType) {
    return schemaType === SchemaType.ERC721 || schemaType === SchemaType.ERC1155
}
