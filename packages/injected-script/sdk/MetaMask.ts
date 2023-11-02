import { BaseInjectedProvider } from './BaseInjected.js'

export class MetaMaskProvider extends BaseInjectedProvider {
    constructor() {
        super('ethereum.__metamask__')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(async () => {
            const isMetaMask = await super.getProperty<boolean>('isMetaMask')
            return !!isMetaMask
        })
    }
}
