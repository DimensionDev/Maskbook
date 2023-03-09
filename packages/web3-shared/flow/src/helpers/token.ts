import {
    createFungibleToken as createFungibleTokenShared,
    CurrencyType,
    type FungibleAsset,
    type FungibleToken,
    leftShift,
    multipliedBy,
} from '@masknet/web3-shared-base'
import { getTokenConstants } from '../constants/index.js'
import { type ChainId, SchemaType } from '../types.js'
import { chainResolver } from './resolver.js'

export function createNativeToken(chainId: ChainId) {
    const nativeCurrency = chainResolver.nativeCurrency(chainId)
    return createFungibleTokenShared<ChainId, SchemaType.Fungible>(
        chainId,
        SchemaType.Fungible,
        getTokenConstants(chainId).FLOW_ADDRESS!,
        nativeCurrency?.name ?? 'Flow',
        nativeCurrency?.symbol ?? 'FLOW',
        nativeCurrency?.decimals ?? 8,
        nativeCurrency?.logoURL,
    )
}

export function createFungibleToken(
    chainId: ChainId,
    address: string,
    name: string,
    symbol: string,
    decimals: number,
    logoURL?: string,
): FungibleToken<ChainId, SchemaType> {
    return createFungibleTokenShared<ChainId, SchemaType.Fungible>(
        chainId,
        SchemaType.Fungible,
        address,
        name,
        symbol,
        decimals,
        logoURL,
    )
}

export function createFungibleAsset(
    token: FungibleToken<ChainId, SchemaType>,
    balance: string,
    price?: {
        [key in CurrencyType]?: string
    },
): FungibleAsset<ChainId, SchemaType> {
    return {
        ...token,
        balance: leftShift(balance, 8).toFixed(),
        price,
        value: {
            [CurrencyType.USD]: multipliedBy(price?.usd ?? 0, leftShift(balance, 8)).toFixed(),
        },
    }
}

export function isNativeTokenSchemaType(schemaType?: SchemaType) {
    // there is no native token schema on flow network
    return false
}

export function isFungibleTokenSchemaType(schemaType?: SchemaType) {
    return schemaType === SchemaType.Fungible
}

export function isNonFungibleTokenSchemaType(schemaType?: SchemaType) {
    return schemaType === SchemaType.NonFungible
}
