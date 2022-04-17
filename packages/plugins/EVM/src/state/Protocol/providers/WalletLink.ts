import type { Provider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class WalletLinkProvider extends BaseInjectedProvider implements Provider {
    constructor() {
        super(['coinbaseWalletExtension'])
    }
}
