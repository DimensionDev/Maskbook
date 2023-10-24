import { WagmiProvider } from './Wagmi.js'

export class WalletConnectProvider extends WagmiProvider {
    constructor() {
        super('WalletConnect')
    }

    override async untilAvailable(): Promise<void> {
        return
    }
}
