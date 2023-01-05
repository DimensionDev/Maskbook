import urlcat from 'urlcat'
import LRUCache from 'lru-cache'
import { first } from 'lodash-es'
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    FungibleAsset,
    HubIndicator,
    HubOptions,
    NonFungibleAsset,
    NonFungibleCollection,
    NonFungibleTokenContract,
    NonFungibleTokenEvent,
    ActivityType,
    Pageable,
    scale10,
    SourceType,
    TokenType,
    Transaction,
} from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'
import {
    ChainId,
    createNativeToken,
    explorerResolver,
    formatEthereumAddress,
    isNativeTokenAddress,
    isValidAddress,
    isValidChainId,
    isValidDomain,
    SchemaType,
    ZERO_ADDRESS,
} from '@masknet/web3-shared-evm'
import { formatAddress } from '@masknet/web3-shared-solana'
import type { ENSRecord, FT, FT_Price, NFT, NFT_FloorPrice, NFT_Metadata, NFT_TransferEvent, Tx } from './types.js'
import { CHAINBASE_API_URL } from './constants.js'
import type { FungibleTokenAPI, HistoryAPI, NonFungibleTokenAPI, DomainAPI } from '../entry-types.js'

async function fetchFromChainbase<T>(pathname: string) {
    const response = await fetch(urlcat(CHAINBASE_API_URL, pathname))
    const json = await response.json()
    const data = json as
        | {
              code: 0 | Omit<number, 0>
              message: 'ok' | Omit<string, 'ok'>
              data: T
          }
        | undefined
    return data?.code === 0 ? data.data : undefined
}

export class ChainbaseHistoryAPI implements HistoryAPI.Provider<ChainId, SchemaType> {
    createTransactionFromTx(chainId: ChainId, tx: Tx): Transaction<ChainId, SchemaType> {
        return {
            id: tx.transaction_hash,
            chainId,
            status: tx.status,
            timestamp: new Date(tx.block_timestamp).getTime(),
            from: tx.from_address,
            to: tx.to_address,
            tokens: EMPTY_LIST,
        }
    }

    async getTransactions(
        address: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const txs = await fetchFromChainbase<Tx[]>(
            urlcat('/v1/account/txs', {
                chainId,
                address,
                page: (indicator?.index ?? 0) + 1,
            }),
        )

        if (!txs) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const assets = txs.map((x) => this.createTransactionFromTx(chainId, x))
        return createPageable(
            assets,
            createIndicator(indicator),
            assets.length ? createNextIndicator(indicator) : undefined,
        )
    }
}

const domainCache = new LRUCache<ChainId, Record<string, string>>({
    max: 100,
    ttl: 300_000,
})

export class ChainbaseDomainAPI implements DomainAPI.Provider<ChainId> {
    private async getAddress(chainId: ChainId, name: string) {
        if (!isValidChainId(chainId)) return

        const response = await fetchFromChainbase<ENSRecord>(
            urlcat(`/v1/${chainId !== ChainId.BSC ? 'ens' : 'space-id'}/records`, { chain_id: chainId, domain: name }),
        )
        return response?.address
    }

    private async getName(chainId: ChainId, address: string) {
        if (!isValidChainId(chainId)) return

        const response = await fetchFromChainbase<ENSRecord[]>(
            urlcat(`/v1/${chainId !== ChainId.BSC ? 'ens' : 'space-id'}/reverse`, { chain_id: chainId, address }),
        )

        const name = first(response)?.name
        if (!name) return
        return isValidDomain(name) ? name : `${name}.eth`
    }

    private addName(chainId: ChainId, name: string, address: string) {
        const formattedAddress = formatEthereumAddress(address)
        const cache = domainCache.get(chainId)

        domainCache.set(chainId, {
            ...cache,
            [name]: formattedAddress,
            [formattedAddress]: name,
        })
    }

    async lookup(chainId: ChainId, name: string): Promise<string | undefined> {
        if (!name) return

        const address = domainCache.get(chainId)?.[name] || (await this.getAddress(chainId, name))
        if (isValidAddress(address)) {
            this.addName(chainId, name, address)
            return formatEthereumAddress(address)
        }

        return
    }

    async reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        if (!address || !isValidAddress(address)) return

        const name = domainCache.get(chainId)?.[formatAddress(address)] || (await this.getName(chainId, address))
        if (name) {
            this.addName(chainId, name, address)
            return name
        }
        return
    }
}

export class ChainbaseFungibleTokenAPI implements FungibleTokenAPI.Provider<ChainId, SchemaType> {
    createFungibleAssetFromFT(chainId: ChainId, token: FT) {
        return {
            chainId,
            id: token.contract_address,
            address: token.contract_address,
            type: TokenType.Fungible,
            schema: SchemaType.ERC20,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            balance: token.balance,
        }
    }

    async getAsset(address: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        if (!isValidChainId(chainId)) return
        const token = await fetchFromChainbase<FT>(
            urlcat('/v1/token/metadata', {
                chain_id: chainId,
                contract_address: address,
            }),
        )

        if (!token) return
        return this.createFungibleAssetFromFT(chainId, token)
    }
    async getAssets(
        address: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId> = {},
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>, HubIndicator>> {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const tokens = await fetchFromChainbase<FT[]>(
            urlcat('/v1/account/tokens', {
                chain_id: chainId,
                address,
                page: (indicator?.index ?? 0) + 1,
            }),
        )

        if (!tokens) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const assets = tokens.map((x) => this.createFungibleAssetFromFT(chainId, x))
        return createPageable(
            assets,
            createIndicator(indicator),
            assets.length ? createNextIndicator(indicator) : undefined,
        )
    }

    async getFungibleTokenPrice(chainId: ChainId, address: string) {
        if (isNativeTokenAddress(address) || !isValidAddress(address) || !isValidChainId(chainId)) return undefined
        const data = await fetchFromChainbase<FT_Price>(
            urlcat('/v1/token/price', { chain_id: chainId, contract_address: address }),
        )

        return data?.price
    }
}

export class ChainbaseNonFungibleTokenAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    createNonFungibleTokenPermalink(chainId: ChainId, address: string, tokenId: string) {
        if (chainId === ChainId.Mainnet || chainId === ChainId.Matic) {
            return urlcat('https://opensea.com/:protocol/:contract/:tokenId', {
                contract: address,
                tokenId,
                protocol: chainId === ChainId.Mainnet ? 'ethereum' : 'matic',
            })
        }
        return explorerResolver.addressLink(chainId, address)
    }

    createNonFungibleTokenAssetFromNFT(chainId: ChainId, nft: NFT): NonFungibleAsset<ChainId, SchemaType> {
        return {
            chainId,
            id: `${chainId}_${nft.contract_address}_${nft.token_id}`,
            type: TokenType.NonFungible,
            schema: nft.contract_type === 'ERC1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
            address: nft.contract_address,
            tokenId: nft.token_id,
            owner: {
                address: nft.owner,
            },
            contract: {
                chainId,
                schema: nft.contract_type === 'ERC1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
                address: nft.contract_address,
                name: nft.contract_name,
                symbol: nft.contract_symbol,
                owner: nft.owner,
            },
            metadata: {
                chainId,
                name: nft.contract_name,
                symbol: nft.contract_symbol,
            },
            source: SourceType.Chainbase,
        }
    }

    createNonFungibleAssetFromNFTMetadata(
        chainId: ChainId,
        address: string,
        tokenId: string,
        metadata: NFT_Metadata,
    ): NonFungibleAsset<ChainId, SchemaType> {
        return {
            chainId,
            type: TokenType.NonFungible,
            id: `${chainId}_${metadata.contract_address}_${metadata.token_id}`,
            schema: SchemaType.ERC721,
            address,
            tokenId,
            link: this.createNonFungibleTokenPermalink(chainId, address, tokenId),
            source: SourceType.Chainbase,
        }
    }

    createNonFungibleContractFromNFTMetadata(
        chainId: ChainId,
        address: string,
        metadata: NFT_Metadata,
    ): NonFungibleTokenContract<ChainId, SchemaType> {
        return {
            chainId,
            address,
            name: metadata.name,
            symbol: metadata.symbol,
            schema: SchemaType.ERC721,
            owner: metadata.owner,
            source: SourceType.Chainbase,
        }
    }

    createNonFungibleCollectionFromNFT(chainId: ChainId, nft: NFT): NonFungibleCollection<ChainId, SchemaType> {
        return {
            chainId,
            schema: nft.contract_type === 'ERC1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
            name: nft.contract_name,
            symbol: nft.contract_symbol,
            slug: nft.contract_symbol,
            address: nft.contract_address,
            source: SourceType.Chainbase,
        }
    }

    createNonFungibleTokenEventFromNFT_TransferEvent(
        chainId: ChainId,
        address: string,
        event: NFT_TransferEvent,
    ): NonFungibleTokenEvent<ChainId, SchemaType> {
        return {
            chainId,
            id: event.transaction_hash,
            quantity: '1',
            type: ActivityType.Transfer,
            assetPermalink: this.createNonFungibleTokenPermalink(chainId, address, event.token_id),
            hash: event.transaction_hash,
            timestamp: new Date(event.block_timestamp).getTime(),
            from: {
                address: event.from_address,
            },
            to: {
                address: event.to_address,
            },
            source: SourceType.Chainbase,
        }
    }

    async getFloorPrice(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        if (!isValidChainId(chainId)) return
        const floorPrice = await fetchFromChainbase<NFT_FloorPrice>(
            urlcat('/v1/nft/floor_price', {
                chain_id: chainId,
                contract_address: address,
            }),
        )
        if (!floorPrice) return
        const nativeToken = createNativeToken(chainId)
        return {
            amount: scale10(floorPrice.floor_price, nativeToken.decimals).toFixed(0),
            token: nativeToken,
        }
    }

    async getOwner(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        if (!isValidChainId(chainId)) return ZERO_ADDRESS
        const owner = await fetchFromChainbase<string>(
            urlcat('/v1/nft/owner', {
                chain_id: chainId,
                contract_address: address,
                token_id: tokenId,
            }),
        )
        return owner ?? ZERO_ADDRESS
    }

    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        if (!isValidChainId(chainId)) return
        const metadata = await fetchFromChainbase<NFT_Metadata>(
            urlcat('/v1/nft/metadata', {
                chain_id: chainId,
                contract_address: address.toLowerCase(),
                token_id: tokenId,
            }),
        )
        if (!metadata) return
        return this.createNonFungibleAssetFromNFTMetadata(chainId, address, tokenId, metadata)
    }

    async getAssets(account: string, { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {}) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const tokens = await fetchFromChainbase<NFT[]>(
            urlcat('/v1/account/nfts', {
                chain_id: chainId,
                address: account.toLowerCase(),
                page: (indicator?.index ?? 0) + 1,
            }),
        )
        if (!tokens) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const assets = tokens.map((x) => this.createNonFungibleTokenAssetFromNFT(chainId, x))
        return createPageable(
            assets,
            createIndicator(indicator),
            assets.length ? createNextIndicator(indicator) : undefined,
        )
    }

    async getCollectionsByKeyword(
        keyword: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {},
    ) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const tokens = await fetchFromChainbase<NFT[]>(
            urlcat('/v1/nft/search', {
                chain_id: chainId,
                name: keyword,
                page: (indicator?.index ?? 0) + 1,
            }),
        )
        if (!tokens) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const assets = tokens.map((x) => this.createNonFungibleCollectionFromNFT(chainId, x))
        return createPageable(
            assets,
            createIndicator(indicator),
            assets.length ? createNextIndicator(indicator) : undefined,
        )
    }

    async getContract(
        address: string,
        { chainId = ChainId.Mainnet }: HubOptions<ChainId, HubIndicator> = {},
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType> | undefined> {
        if (!isValidChainId(chainId)) return
        const metadata = await fetchFromChainbase<NFT_Metadata>(
            urlcat('/v1/nft/metadata', {
                chain_id: chainId,
                contract_address: address.toLowerCase(),
                token_id: 1,
            }),
        )
        if (!metadata) return
        return this.createNonFungibleContractFromNFTMetadata(chainId, address, metadata)
    }

    async getEvents(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, indicator }: HubOptions<ChainId, HubIndicator> = {},
    ) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const transferEvents = await fetchFromChainbase<NFT_TransferEvent[]>(
            urlcat('/v1/nft/transfers', {
                chainId,
                contract_address: address,
                token_id: tokenId,
                page: (indicator?.index ?? 0) + 1,
            }),
        )

        if (!transferEvents?.length) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const events = transferEvents.map((x) =>
            this.createNonFungibleTokenEventFromNFT_TransferEvent(chainId, address, x),
        )
        return createPageable(
            events,
            createIndicator(indicator),
            events.length ? createNextIndicator(indicator) : undefined,
        )
    }
}
