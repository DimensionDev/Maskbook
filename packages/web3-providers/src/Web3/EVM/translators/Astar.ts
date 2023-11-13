import { ChainId } from '@masknet/web3-shared-evm'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { BaseTranslator } from './Base.js'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'

export class AstarTranslator extends BaseTranslator {
    override async encode(context: ConnectionContext): Promise<void> {
        await super.encode(context)
        if (context.chainId !== ChainId.Astar) return
        if (!context.config) return

        context.config = {
            ...context.config,
            maxFeePerGas: context.config.maxFeePerGas ? web3_utils.toHex(context.config.maxFeePerGas) : undefined,
            maxPriorityFeePerGas:
                context.config.maxPriorityFeePerGas ? web3_utils.toHex(context.config.maxPriorityFeePerGas) : undefined,
            // rpc hack, alchemy rpc must pass gas parameter
            gas: '0x135168',
        }
    }
}
