import { BaseWagmiProvider } from './BaseWagmi.js'

export class MetaMaskProvider extends BaseWagmiProvider {
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
