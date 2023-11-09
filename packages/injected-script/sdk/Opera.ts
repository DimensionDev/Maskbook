import { InjectedWalletBridge } from './BaseInjected.js'

export class OperaProvider extends InjectedWalletBridge {
    constructor() {
        super('ethereum')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(async () => {
            const isOpera = await super.getProperty<boolean>('isOpera')
            return !!isOpera
        })
    }
}
