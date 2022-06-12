import { Emitter } from '@servie/events';
import type { BalanceEvent, BalanceNotifierState as Web3BalanceNotifierState } from '@masknet/web3-shared-base'

export class BalanceNotifierState<ChainId> implements Web3BalanceNotifierState<ChainId>  {
    emitter: Emitter<BalanceEvent<ChainId>> = new Emitter()
}
