import { ChainId, type ConnectionContext } from '@masknet/web3-shared-evm'
import { Base } from './Base.js'

export class Astar extends Base {
    override async encode(context: ConnectionContext): Promise<void> {
        await super.encode(context)
        if (context.chainId !== ChainId.Astar) return
        if (!context.config) return

        context.config = {
            ...context.config,
            // rpc hack, alchemy rpc must pass gas parameter
            gas: '0x135168',
        }
    }
}
