import { SourceType, attemptUntil } from '@masknet/web3-shared-base'
import {
    ChainId,
    type SchemaType,
    type ProviderType,
    type NetworkType,
    type MessageRequest,
    type MessageResponse,
    type Transaction,
    type TransactionParameter,
} from '@masknet/web3-shared-evm'
import { Web3Readonly } from './ConnectionReadonlyAPI.js'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'
import { HubFungibleAPI_Base } from '../../Base/apis/HubFungibleAPI.js'
import { Web3StateRef } from './Web3StateAPI.js'
import { HubOptionsAPI } from './HubOptionsAPI.js'
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

export class HubFungibleAPI extends HubFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> {
    protected override HubOptions = new HubOptionsAPI(this.options)

    protected override getProviders(initial?: HubOptions_Base<ChainId>) {
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

    override getFungibleToken(address: string, initial?: HubOptions_Base<ChainId> | undefined) {
        const networks = Web3StateRef.value?.Network?.networks?.getCurrentValue()
        const currentNetwork = initial?.chainId
            ? networks?.find((x) => x.chainId === initial.chainId)
            : Web3StateRef.value?.Network?.network?.getCurrentValue()
        return attemptUntil(
            [
                () => Web3StateRef.value?.Token?.createFungibleToken?.(initial?.chainId ?? ChainId.Mainnet, address),
                () =>
                    Web3Readonly.getFungibleToken(address, {
                        ...initial,
                        providerURL: currentNetwork?.isCustomized ? currentNetwork?.rpcUrl : undefined,
                    }),
            ],
            undefined,
        )
    }
}
