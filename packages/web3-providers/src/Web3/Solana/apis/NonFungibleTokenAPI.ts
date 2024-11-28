// cspell:ignore metaplex
import { createIndicator, createPageable, type Pageable } from '@masknet/shared-base'
import { type NonFungibleAsset, TokenType } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-solana'
import { fetchAllDigitalAssetByOwner } from '@metaplex-foundation/mpl-token-metadata'
import { publicKey } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import * as solanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'
import type { NonFungibleTokenAPI } from '../../../entry-types.js'
import type { SolanaHubOptions } from '../types/index.js'

async function getNonFungibleAssets(
    chainId: ChainId,
    account: string,
): Promise<Array<NonFungibleAsset<ChainId, SchemaType>>> {
    const umi = createUmi(solanaWeb3.clusterApiUrl('mainnet-beta'))
    const ownerPublicKey = publicKey(account)
    const allNFTs = await fetchAllDigitalAssetByOwner(umi, ownerPublicKey)
    return allNFTs.map((asset) => {
        return {
            id: asset.mint.publicKey.toString(),
            tokenId: asset.mint.publicKey.toString(),
            chainId,
            type: TokenType.NonFungible,
            schema: SchemaType.NonFungible,
            address: '',
            contract: {
                chainId,
                name: asset.metadata.name,
                symbol: asset.metadata.symbol,
                address: asset.metadata.publicKey,
                schema: SchemaType.NonFungible,
            },
            metadata: {
                chainId,
                name: asset.metadata.name,
                symbol: asset.metadata.symbol,
                description: '',
                mediaURL: asset.metadata.uri,
            },
        }
    })
}

class SolanaNonFungibleTokenAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAssets(
        address: string,
        options?: SolanaHubOptions,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const tokens = await getNonFungibleAssets(options?.chainId ?? ChainId.Mainnet, address)

        return createPageable(tokens, createIndicator(options?.indicator))
    }
}
export const SolanaNonFungible = new SolanaNonFungibleTokenAPI()
