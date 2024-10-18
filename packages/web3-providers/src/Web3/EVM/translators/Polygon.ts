import { EthereumMethodType, PayloadEditor, ProviderType } from '@masknet/web3-shared-evm'
import { BaseTranslator } from './Base.js'
import { EVMWeb3Readonly } from '../apis/ConnectionReadonlyAPI.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'

export class PolygonTranslator extends BaseTranslator {
    override async encode(context: ConnectionContext): Promise<void> {
        await super.encode(context)
        if (!context.config) return

        if (context.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return

        const config = {
            ...context.config,
            // keep the legacy gasPrice
            ...(PayloadEditor.fromPayload(context.request) ?
                {}
            :   {
                    gasPrice:
                        context.config.gasPrice ?? (await EVMWeb3Readonly.getGasPrice({ chainId: context.chainId })),
                }),
        }

        delete config.maxFeePerGas
        delete config.maxPriorityFeePerGas

        context.config = config
    }
}
