import { BaseWagmiProvider } from './BaseWagmi.js'

export class WalletConnectProvider extends BaseWagmiProvider {
    constructor() {
        super('WalletConnect', '')
    }

    override async untilAvailable(): Promise<void> {
        return
    }
}
