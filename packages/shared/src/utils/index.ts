import { CurrencyType, TokenType, Web3Plugin } from '@masknet/plugin-infra/web3'
import { leftShift, multipliedBy } from '@masknet/web3-shared-base'

export function createFungibleToken<ChainId, SchemaType>(
    chainId: ChainId,
    schema: SchemaType,
    address: string,
    name: string,
    symbol: string,
    decimals: number,
    logoURI?: string,
): Web3Plugin.FungibleToken<ChainId, SchemaType> {
    return {
        id: address,
        chainId,
        type: TokenType.Fungible,
        schema,
        address,
        name,
        symbol,
        decimals,
        logoURI,
    }
}

export function createFungibleAsset<ChainId, SchemaType>(
    token: Web3Plugin.FungibleToken<ChainId, SchemaType>,
    balance: string,
    price?: { [key in CurrencyType]?: string },
): Web3Plugin.FungibleAsset<ChainId, SchemaType> {
    return {
        ...token,
        balance: leftShift(balance, token.decimals ?? 0).toFixed(),
        price,
        value: {
            [CurrencyType.USD]: multipliedBy(price?.usd ?? 0, leftShift(balance, token.decimals ?? 0)).toFixed(),
        },
    }
}

export function createNonFungileToken<ChainId, SchemaType>(
    chainId: ChainId,
    schema: SchemaType,
    address: string,
    tokenId: string,
    contract: Web3Plugin.NonFungibleToken<ChainId, SchemaType>['contract'],
    metadata: Web3Plugin.NonFungibleToken<ChainId, SchemaType>['metadata'],
    collection?: Web3Plugin.NonFungibleToken<ChainId, SchemaType>['collection'],
): Web3Plugin.NonFungibleToken<ChainId, SchemaType> {
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

export function createChainDetailed<ChainId>(
    chainId: ChainId,
    name: string,
    fullName: string,
    shortName: string,
    isMainnet: boolean,
): Web3Plugin.ChainDetailed<ChainId> {
    return {
        chainId,
        name,
        fullName,
        shortName,
        chainName: name,
        network: isMainnet ? 'mainnet' : 'testnet',
    }
}
