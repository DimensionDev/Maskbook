import { InjectedProvider } from './Base'

export class MetaMaskProvider extends InjectedProvider {
    constructor() {
        super('ethereum')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(() => super.getProperty('isMetaMask') as Promise<boolean>)
    }
}
