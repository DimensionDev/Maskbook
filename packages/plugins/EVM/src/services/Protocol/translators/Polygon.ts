import { ProviderType } from '@masknet/web3-shared-evm'
import type { Context } from '../types'
import { Base } from './Base'

export class Polygon extends Base {
    override encode(context: Context): void {
        if (!context.config) return

        // the current version of metamask doesn't support polygon with EIP1559
        if (context.providerType !== ProviderType.MetaMask) return

        // keep the legacy gasPrice
        const gasPrice = context.config.gasPrice

        super.encode(context)

        const config = {
            ...context.config,
            gasPrice,
        }

        delete config.maxFeePerGas
        delete config.maxPriorityFeePerGas

        context.config = config
    }
}
