import { Emitter } from '@servie/events';
import type { BlockNumberEvent, BlockNumberNotifierState as Web3BlockNumberNotifierState } from '@masknet/web3-shared-base'

export class BlockNumberNotifierState<ChainId> implements Web3BlockNumberNotifierState<ChainId> {
    emitter: Emitter<BlockNumberEvent<ChainId>> = new Emitter()
}
