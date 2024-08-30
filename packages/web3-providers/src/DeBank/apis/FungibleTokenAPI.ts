import urlcat from 'urlcat'
import { unionWith } from 'lodash-es'
import { isSameAddress, type FungibleToken } from '@masknet/web3-shared-base'
import { createPageable, createIndicator } from '@masknet/shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { FungibleTokenAPI as EVM_FungibleTokenAPI } from '../../Web3/EVM/apis/FungibleTokenAPI.js'
import { formatAssets } from '../helpers.js'
import type { WalletTokenRecord, UserTotalBalance } from '../types.js'
import { DEBANK_OPEN_API } from '../constants.js'
import { Duration } from '../../helpers/fetchCached.js'
import { fetchCachedJSON } from '../../helpers/fetchJSON.js'
import { getNativeAssets } from '../../helpers/getNativeAssets.js'
import type { FungibleTokenAPI, BaseHubOptions } from '../../entry-types.js'

class DeBankFungibleTokenAPI implements FungibleTokenAPI.Provider<ChainId, SchemaType> {
    private FungibleToken = new EVM_FungibleTokenAPI()

    async getAssets(address: string, options?: BaseHubOptions<ChainId>) {
        const result = (
            await fetchCachedJSON<WalletTokenRecord[] | undefined>(
                urlcat(DEBANK_OPEN_API, '/v1/user/all_token_list', {
                    id: address,
                    is_all: true,
                }),
                undefined,
                {
                    cacheDuration: Duration.TEN_SECONDS,
                },
            )
        )?.filter((x) => x.is_verified)

        return createPageable(
            unionWith(
                formatAssets(
                    (result ?? []).map((x) => {
                        const isEther = ['arb', 'aurora'].includes(x.chain) && ['ETH', 'AETH'].includes(x.name)
                        return {
                            ...x,
                            name: isEther ? 'ETH' : x.name,
                            symbol: isEther ? 'ETH' : x.symbol,
                            logo_url:
                                isEther ?
                                    'https://imagedelivery.net/PCnTHRkdRhGodr0AWBAvMA/Assets/blockchains/ethereum/info/logo.png/quality=85'
                                :   x.logo_url,
                        }
                    }),
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
        options?: BaseHubOptions<ChainId>,
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

    async getTotalBalance(/** address */ id: string) {
        const url = urlcat(DEBANK_OPEN_API, '/v1/user/total_balance', { id })
        return fetchCachedJSON<UserTotalBalance>(url)
    }
}
export const DeBankFungibleToken = new DeBankFungibleTokenAPI()
