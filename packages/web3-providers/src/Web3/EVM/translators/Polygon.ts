import { EthereumMethodType, PayloadEditor, ProviderType } from '@masknet/web3-shared-evm'
import { Base } from './Base.js'
import { ConnectionAPI } from '../apis/ConnectionAPI.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'

export class Polygon extends Base {
    private Web3 = new ConnectionAPI()

    override async encode(context: ConnectionContext): Promise<void> {
        await super.encode(context)
        if (!context.config) return

        // the current version of metamask doesn't support polygon with EIP1559
        if (context.providerType !== ProviderType.MetaMask) return

        if (context.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return

        const config = {
            ...context.config,
            // keep the legacy gasPrice
            ...(PayloadEditor.fromPayload(context.request)
                ? {}
                : {
                      gasPrice: context.config.gasPrice ?? (await this.Web3.getGasPrice()),
                  }),
        }

        delete config.maxFeePerGas
        delete config.maxPriorityFeePerGas

        context.config = config
    }
}
