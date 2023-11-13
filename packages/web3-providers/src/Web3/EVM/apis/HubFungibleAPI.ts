import { SourceType, attemptUntil } from '@masknet/web3-shared-base'
import { ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { EVMWeb3Readonly } from './ConnectionReadonlyAPI.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptions.js'
import { BaseHubFungible } from '../../Base/apis/HubFungible.js'
import { evm } from '../../../Manager/registry.js'
import { EVMHubOptionsProvider } from './HubOptionsAPI.js'
import type { AuthorizationAPI, FungibleTokenAPI, TokenListAPI, TokenIconAPI, PriceAPI } from '../../../entry-types.js'
import { Approval } from '../../../Approval/index.js'
import { ChainbaseFungibleToken } from '../../../Chainbase/index.js'
import { Cloudflare } from '../../../Cloudflare/index.js'
import { CoinGeckoPriceEVM } from '../../../CoinGecko/index.js'
import { DeBankFungibleToken } from '../../../DeBank/index.js'
import { GoPlusAuthorization } from '../../../GoPlusLabs/index.js'
import { R2D2TokenList } from '../../../R2D2/index.js'
import { Rabby } from '../../../Rabby/index.js'
import { Zerion } from '../../../Zerion/index.js'

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
                [SourceType.Chainbase]: ChainbaseFungibleToken,
                [SourceType.DeBank]: DeBankFungibleToken,
                [SourceType.Zerion]: Zerion,
                [SourceType.GoPlus]: GoPlusAuthorization,
                [SourceType.Rabby]: Rabby,
                [SourceType.Approval]: Approval,
                [SourceType.R2D2]: R2D2TokenList,
                [SourceType.CF]: Cloudflare,
                [SourceType.CoinGecko]: CoinGeckoPriceEVM,
            },
            [
                DeBankFungibleToken,
                Approval,
                Zerion,
                ChainbaseFungibleToken,
                Rabby,
                GoPlusAuthorization,
                R2D2TokenList,
                Cloudflare,
                CoinGeckoPriceEVM,
            ],
            initial,
        )
    }

    override getFungibleToken(address: string, initial?: BaseHubOptions<ChainId> | undefined) {
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
