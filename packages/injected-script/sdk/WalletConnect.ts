import { WagmiProvider } from './Wagmi.js'

export class WalletConnectProvider extends WagmiProvider {
    constructor() {
        super('WalletConnect', 'location')
    }

    override async untilAvailable(): Promise<void> {
        return
    }
}
