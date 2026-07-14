import { SourceType, attemptUntil } from '@masknet/web3-shared-base'
import { ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { EVMWeb3Readonly } from './ConnectionReadonlyAPI.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptions.js'
import { BaseHubFungible } from '../../Base/apis/HubFungible.js'
import { evm } from '../../../Manager/registry.js'
import { EVMHubOptionsProvider } from './HubOptionsAPI.js'
import type { AuthorizationAPI, FungibleTokenAPI, TokenListAPI, TokenIconAPI, PriceAPI } from '../../../entry-types.js'
import defer * as ChainbaseFungibleToken from '../../../Chainbase/index.js'
import defer * as Cloudflare from '../../../Cloudflare/index.js'
import defer * as CoinGeckoPriceEVM from '../../../CoinGecko/index.js'
import defer * as DeBankFungibleToken from '../../../DeBank/index.js'
import defer * as GoPlusAuthorization from '../../../GoPlusLabs/index.js'
import defer * as R2D2TokenList from '../../../R2D2/index.js'
import defer * as Rabby from '../../../Rabby/index.js'

export class HubFungibleAPI extends BaseHubFungible<ChainId, SchemaType> {
    protected override HubOptions = new EVMHubOptionsProvider(this.options)

    protected override getProvidersFungible(initial?: BaseHubOptions<ChainId>) {
        const { indicator } = this.HubOptions.fill(initial)

        // only the first page is available
        if ((indicator?.index ?? 0) > 0) return []

        return this.getPredicateProviders<
            AuthorizationAPI.Provider<ChainId> &
                FungibleTokenAPI.Provider<ChainId, SchemaType> &
                TokenListAPI.Provider<ChainId, SchemaType> &
                TokenIconAPI.Provider<ChainId> &
                PriceAPI.Provider<ChainId>
        >(
            {
                [SourceType.Chainbase]: ChainbaseFungibleToken.ChainbaseFungibleToken,
                [SourceType.DeBank]: DeBankFungibleToken.DeBankFungibleToken,
                [SourceType.GoPlus]: GoPlusAuthorization.GoPlusAuthorization,
                [SourceType.Rabby]: Rabby.Rabby,
                [SourceType.R2D2]: R2D2TokenList.R2D2TokenList,
                [SourceType.CF]: Cloudflare.Cloudflare,
                [SourceType.CoinGecko]: CoinGeckoPriceEVM.CoinGeckoPriceEVM,
            },
            [
                DeBankFungibleToken.DeBankFungibleToken,
                ChainbaseFungibleToken.ChainbaseFungibleToken,
                Rabby.Rabby,
                GoPlusAuthorization.GoPlusAuthorization,
                R2D2TokenList.R2D2TokenList,
                Cloudflare.Cloudflare,
                CoinGeckoPriceEVM.CoinGeckoPriceEVM,
            ],
            initial,
        )
    }

    override getFungibleToken(address: string, initial?: BaseHubOptions<ChainId>) {
        const networks = evm.state?.Network?.networks?.getCurrentValue()
        const currentNetwork =
            initial?.chainId ?
                networks?.find((x) => x.chainId === initial.chainId)
            :   evm.state?.Network?.network?.getCurrentValue()
        return attemptUntil(
            [
                () => evm.state?.Token?.createFungibleToken?.(initial?.chainId ?? ChainId.Mainnet, address),
                () =>
                    EVMWeb3Readonly.getFungibleToken(address, {
                        ...initial,
                        providerURL: currentNetwork?.isCustomized ? currentNetwork?.rpcUrl : undefined,
                    }),
            ],
            undefined,
        )
    }
}
