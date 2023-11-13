import { SourceType, TokenType, type NonFungibleAsset, type NonFungibleCollection } from '@masknet/web3-shared-base'
import { isValidDomain, ChainId, SchemaType, isValidChainId } from '@masknet/web3-shared-solana'
import { isEmpty } from 'lodash-es'
import { createPermalink as SolanaCreatePermalink } from '../NFTScan/helpers/Solana.js'
import { getAssetFullName } from '../helpers/getAssetFullName.js'
import { type SimpleHash } from '../types/SimpleHash.js'
import { SPAM_SCORE } from './constants.js'

export function createSolanaNonFungibleAsset(
    asset: SimpleHash.Asset,
): NonFungibleAsset<ChainId, SchemaType> | undefined {
    if (isEmpty(asset)) return
    const chainId = resolveSolanaChainId(asset.chain)
    const address = asset.contract_address
    const schema = SchemaType.NonFungible

    const spam_score = asset.collection.spam_score
    if (!chainId || !isValidChainId(chainId) || !address || (spam_score !== null && spam_score >= SPAM_SCORE)) return
    // On Solana the contract is synonymous with the mint address - the field name on collection is recommended instead
    const name =
        isValidDomain(asset.name) ?
            asset.name
        :   getAssetFullName(asset.contract_address, asset.collection.name, asset.name, asset.token_id)

    return {
        id: address,
        chainId,
        link: SolanaCreatePermalink(chainId, address),
        tokenId: asset.token_id,
        type: TokenType.NonFungible,
        address,
        schema,
        creator: {
            address: asset.contract.deployed_by,
        },
        owner: {
            address: asset.owners?.[0].owner_address,
        },
        // TODO
        priceInToken: undefined,
        metadata: {
            chainId,
            name,
            tokenId: asset.token_id,
            symbol: asset.contract.symbol,
            description: asset.description,
            imageURL: asset.image_url || asset.previews.image_large_url,
            previewImageURL: asset.previews.image_small_url,
            blurhash: asset.previews.blurhash,
            mediaURL: asset.image_url || asset.previews.image_large_url,
        },
        contract: {
            chainId,
            schema,
            address: asset.contract_address,
            // On Solana the contract is synonymous with the mint address - the field name on collection is recommended instead
            name: asset.collection.name,
            symbol: asset.contract.symbol,
        },
        collection: {
            id: asset.collection.collection_id,
            chainId,
            name: asset.collection.name || '',
            slug: asset.contract.name,
            description: asset.collection.description,
            address: asset.contract_address,
            iconURL: asset.collection.image_url,
            verified: Boolean(asset.collection.marketplace_pages?.some((x) => x.verified)),
            createdAt: new Date(asset.created_date).getTime(),
        },
        source: SourceType.SimpleHash,
    }
}

export function createSolanaNonFungibleCollection(
    collection: SimpleHash.Collection,
): NonFungibleCollection<ChainId, SchemaType> {
    const chainId = resolveSolanaChainId(collection.chain)!

    const verifiedMarketplaces = collection.marketplace_pages?.filter((x) => x.verified) || []
    return {
        id: collection.id,
        chainId,
        name: collection.name || '',
        slug: collection.name,
        schema: SchemaType.NonFungible,
        balance: collection.distinct_nfts_owned,
        iconURL: collection.image_url,
        ownersTotal: collection.total_quantity,
        source: SourceType.SimpleHash,
        address: collection.top_contracts?.[0]?.split('.')?.[1] ?? '',
        verified: verifiedMarketplaces.length > 0,
        verifiedBy: verifiedMarketplaces.map((x) => x.marketplace_name),
    }
}

export function resolveSolanaChainId(chain: string): ChainId | undefined {
    // Some of the `chainResolver.chainId()` results do not match.
    switch (chain) {
        case 'solana':
            return ChainId.Mainnet
        default:
            return undefined
    }
}
