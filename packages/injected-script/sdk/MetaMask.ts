import { InjectedProvider } from './Base.js'

export class MetaMaskProvider extends InjectedProvider {
    constructor() {
        super('__metamask__')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(async () => {
            const isMetaMask = await super.getProperty<boolean>('isMetaMask')
            return !!isMetaMask
        })
    }
}
