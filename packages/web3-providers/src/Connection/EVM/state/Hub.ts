import type { CurrencyType, SourceType } from '@masknet/web3-shared-base'
import {
    isValidChainId,
    getDefaultChainId,
    type ChainId,
    type GasOption,
    type SchemaType,
} from '@masknet/web3-shared-evm'
import type { Plugin } from '@masknet/plugin-infra'
import type { Subscription } from 'use-subscription'
import { createHub } from './Hub/hub.js'
import { HubState } from '../../Base/state/Hub.js'

export class Hub extends HubState<ChainId, SchemaType, GasOption> {
    constructor(
        private context: Plugin.Shared.SharedUIContext,
        subscription: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
            sourceType?: Subscription<SourceType>
            currencyType?: Subscription<CurrencyType>
        },
    ) {
        super(createHub, subscription, {
            isValidChainId,
            getDefaultChainId,
        })
    }
}
