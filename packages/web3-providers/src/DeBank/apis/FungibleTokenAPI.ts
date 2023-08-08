import urlcat from 'urlcat'
import { unionWith } from 'lodash-es'
import { isSameAddress, type FungibleToken } from '@masknet/web3-shared-base'
import { createPageable, createIndicator } from '@masknet/shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { FungibleTokenAPI as EVM_FungibleTokenAPI } from '../../Web3/EVM/apis/FungibleTokenAPI.js'
import { formatAssets, resolveDeBankAssetId } from '../helpers.js'
import type { WalletTokenRecord } from '../types.js'
import { DEBANK_OPEN_API } from '../constants.js'
import { Duration } from '../../helpers/fetchCached.js'
import { fetchCachedJSON } from '../../helpers/fetchJSON.js'
import { getNativeAssets } from '../../helpers/getNativeAssets.js'
import type { FungibleTokenAPI, HubOptions_Base } from '../../entry-types.js'

export class DeBankFungibleTokenAPI implements FungibleTokenAPI.Provider<ChainId, SchemaType> {
    private FungibleToken = new EVM_FungibleTokenAPI()

    async getAssets(address: string, options?: HubOptions_Base<ChainId>) {
        const result = await fetchCachedJSON<WalletTokenRecord[] | undefined>(
            urlcat(DEBANK_OPEN_API, '/v1/user/all_token_list', {
                id: address,
                is_all: false,
            }),
            undefined,
            {
                cacheDuration: Duration.MINIMAL,
            },
        )

        return createPageable(
            unionWith(
                formatAssets(
                    (result ?? []).map((x) => ({
                        ...x,
                        // rename bsc to bnb
                        id: resolveDeBankAssetId(x.id),
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
        options?: HubOptions_Base<ChainId>,
    ) {
        const trustTokenAssets = await this.FungibleToken.getTrustedAssets(address, trustedFungibleTokens, options)
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
