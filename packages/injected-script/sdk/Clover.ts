import { InjectedWalletBridge } from './BaseInjected.js'

export class CloverProvider extends InjectedWalletBridge {
    constructor() {
        super('clover')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(async () => {
            const isClover = await super.getProperty<boolean>('isClover')
            return !!isClover
        })
    }
}
