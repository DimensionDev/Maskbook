import { InjectedProvider } from './Base.js'

export class ClvWalletProvider extends InjectedProvider {
    constructor() {
        super('clover')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(() => super.getProperty('isClover') as Promise<boolean>)
    }
}
