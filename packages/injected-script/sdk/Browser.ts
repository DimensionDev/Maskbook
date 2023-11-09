import { InjectedWalletBridge } from './BaseInjected.js'

export class BrowserProvider extends InjectedWalletBridge {
    constructor() {
        super('ethereum')
    }
}
