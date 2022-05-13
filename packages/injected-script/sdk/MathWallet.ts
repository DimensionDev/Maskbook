import { InjectedProvider } from './Base'

export class MathWalletProvider extends InjectedProvider {
    constructor() {
        super('ethereum')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(() => super.getProperty<boolean>('isMathWallet'))
    }
}
