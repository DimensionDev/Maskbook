import { BaseInjectedProvider } from './BaseInjected.js'

export class BrowserProvider extends BaseInjectedProvider {
    constructor() {
        super('ethereum')
    }
}
