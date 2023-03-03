import urlcat from 'urlcat'
import { unionWith } from 'lodash-es'
import {
    createPageable,
    type HubOptions,
    createIndicator,
    isSameAddress,
    type FungibleToken,
    type HubIndicator,
} from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { formatAssets, resolveDeBankAssetId } from '../helpers.js'
import type { WalletTokenRecord } from '../types.js'
import { fetchJSON, getNativeAssets } from '../../entry-helpers.js'
import type { FungibleTokenAPI } from '../../entry-types.js'
import { ContractFungibleTokenAPI } from '../../Contracts/index.js'

const DEBANK_OPEN_API = 'https://debank-proxy.r2d2.to'

export class DeBankFungibleTokenAPI implements FungibleTokenAPI.Provider<ChainId, SchemaType> {
    private contractFungibleToken = new ContractFungibleTokenAPI()

    async getAssets(address: string, options?: HubOptions<ChainId>) {
        const result = await fetchJSON<WalletTokenRecord[] | undefined>(
            urlcat(DEBANK_OPEN_API, '/v1/user/all_token_list', {
                id: address,
                is_all: false,
            }),
        )

        return createPageable(
            unionWith(
                formatAssets(
                    (result ?? []).map((x) => ({
                        ...x,

                        // rename bsc to bnb
                        id: resolveDeBankAssetId(x.id),
                        chain: resolveDeBankAssetId(x.chain),
                        // prefix ARETH
                        symbol: x.chain === 'arb' && x.symbol === 'ETH' ? 'ARETH' : x.symbol,
                        logo_url:
                            x.chain === 'arb' && x.symbol === 'ETH'
                                ? 'https://assets.debank.com/static/media/arbitrum.8e326f58.svg'
                                : x.logo_url,
                    })),
                ),
                getNativeAssets(),
                (a, z) => isSameAddress(a.address, z.address) && a.chainId === z.chainId,
            ),
            createIndicator(options?.indicator),
        )
    }

    async getTrustedAssets(
        address: string,
        trustedFungibleTokens?: Array<FungibleToken<ChainId, SchemaType>>,
        options?: HubOptions<ChainId, HubIndicator>,
    ) {
        const trustTokenAssets = await this.contractFungibleToken.getTrustedAssets(
            address,
            trustedFungibleTokens,
            options,
        )
        return createPageable(
            unionWith(
                trustTokenAssets.data,
                getNativeAssets(),
                (a, z) => isSameAddress(a.address, z.address) && a.chainId === z.chainId,
            ),
            createIndicator(options?.indicator),
        )
    }
}
