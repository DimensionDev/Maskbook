import { EthereumMethodType, PayloadEditor, ProviderType } from '@masknet/web3-shared-evm'
import { Base } from './Base.js'
import { ConnectionReadonlyAPI } from '../apis/ConnectionReadonlyAPI.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'

const Web3 = new ConnectionReadonlyAPI()

export class Polygon extends Base {
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
                      gasPrice: context.config.gasPrice ?? (await Web3.getGasPrice({ chainId: context.chainId })),
                  }),
        }

        delete config.maxFeePerGas
        delete config.maxPriorityFeePerGas

        context.config = config
    }
}
