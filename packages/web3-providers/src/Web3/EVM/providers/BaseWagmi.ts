import type { Account } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { BaseInjectedProvider } from './BaseInjected.js'

export class BaseWagmiProvider extends BaseInjectedProvider {
    override async connect(chainId?: number) {
        const account = await this.bridge.connect({
            chainId,
        })

        console.log('DEBUG: account', account)

        return account as Account<ChainId>
    }

    override async disconnect(): Promise<void> {
        return this.bridge.disconnect()
    }
}
