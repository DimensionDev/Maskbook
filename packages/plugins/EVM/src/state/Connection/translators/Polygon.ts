import { EthereumMethodType, ProviderType } from '@masknet/web3-shared-evm'
import type { Context } from '../types'
import { isReadOnlyMethod } from '../connection'
import { Base } from './Base'

export class Polygon extends Base {
    override async encode(context: Context): Promise<void> {
        await super.encode(context)
        if (!context.config) return

        // the current version of metamask doesn't support polygon with EIP1559
        if (context.providerType !== ProviderType.MetaMask) return

        if (context.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return

        const config = {
            ...context.config,
            // keep the legacy gasPrice
            ...(isReadOnlyMethod(context.method)
                ? {}
                : { gasPrice: context.config.gasPrice ?? (await context.connection.getGasPrice()) }),
        }

        delete config.maxFeePerGas
        delete config.maxPriorityFeePerGas

        context.config = config
    }
}
