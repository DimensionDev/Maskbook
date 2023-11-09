import type { ChainId } from '@masknet/web3-shared-evm'
import { BalanceNotifierState } from '../../Base/state/BalanceNotifier.js'

export class EVMBalanceNotifier extends BalanceNotifierState<ChainId> {}
