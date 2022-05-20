import type { CurrencyType, SourceType } from '@masknet/web3-shared-base'
import { HubState } from '@masknet/plugin-infra/web3'
import type { ChainId, GasOption, SchemaType } from '@masknet/web3-shared-solana'
import type { Plugin } from '@masknet/plugin-infra'
import type { Subscription } from 'use-subscription'
import { createHub } from './Hub/hub'

export class Hub extends HubState<ChainId, SchemaType, GasOption> {
    constructor(
        private context: Plugin.Shared.SharedContext,
        subscription: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
            sourceType?: Subscription<SourceType>
            currencyType?: Subscription<CurrencyType>
        },
    ) {
        super(createHub, subscription)
    }
}
