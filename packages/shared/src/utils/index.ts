import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    CurrencyType,
    TokenType,
    isSameAddress,
    leftShift,
    multipliedBy,
    type FungibleAsset,
    type FungibleToken,
    type NonFungibleToken,
} from '@masknet/web3-shared-base'

export function createFungibleToken<ChainId, SchemaType>(
    chainId: ChainId,
    schema: SchemaType,
    address: string,
    name: string,
    symbol: string,
    decimals: number,
    logoURL?: string,
): FungibleToken<ChainId, SchemaType> {
    return {
        id: address,
        chainId,
        type: TokenType.Fungible,
        schema,
        address,
        name,
        symbol,
        decimals,
        logoURL,
    }
}

export function createFungibleAsset<ChainId, SchemaType>(
    token: FungibleToken<ChainId, SchemaType>,
    balance: string,
    price?: { [key in CurrencyType]?: string },
): FungibleAsset<ChainId, SchemaType> {
    return {
        ...token,
        balance: leftShift(balance, token.decimals ?? 0).toFixed(),
        price,
        value: {
            [CurrencyType.USD]: multipliedBy(price.usd ?? 0, leftShift(balance, token.decimals ?? 0)).toFixed(),
        },
    }
}

export function createNonFungibleToken<ChainId, SchemaType>(
    chainId: ChainId,
    schema: SchemaType,
    address: string,
    tokenId: string,
    contract: NonFungibleToken<ChainId, SchemaType>['contract'],
    metadata: NonFungibleToken<ChainId, SchemaType>['metadata'],
    collection?: NonFungibleToken<ChainId, SchemaType>['collection'],
): NonFungibleToken<ChainId, SchemaType> {
    return {
        id: address,
        type: TokenType.NonFungible,
        schema,
        chainId,
        tokenId,
        address,
        contract,
        metadata,
        collection,
    }
}

export const formatPublicKey = (publicKey?: string) => {
    if (!publicKey) return ''
    return `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`
}

export function isSameNFT(
    pluginID: NetworkPluginID,
    a: Web3Helper.NonFungibleAssetAll,
    b?: Web3Helper.NonFungibleAssetAll,
) {
    if (pluginID === NetworkPluginID.PLUGIN_SOLANA) return a.tokenId === b?.tokenId && a.id === b.id
    if (!a.contract) return false
    return (
        isSameAddress(a.contract.address, b?.contract?.address) &&
        a.contract.chainId === b?.contract?.chainId &&
        a.tokenId === b.tokenId
    )
}
