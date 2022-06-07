import { InjectedProvider } from './Base'

export class PhantomProvider extends InjectedProvider {
    constructor() {
        super('phantom.solana')
    }
}
