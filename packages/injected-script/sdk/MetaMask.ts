import { WagmiProvider } from './Wagmi.js'

export class MetaMaskProvider extends WagmiProvider {
    constructor() {
        super('MetaMask', 'ethereum.__metamask__')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(async () => {
            const isMetaMask = await super.getProperty<boolean>('isMetaMask')
            return !!isMetaMask
        })
    }
}
