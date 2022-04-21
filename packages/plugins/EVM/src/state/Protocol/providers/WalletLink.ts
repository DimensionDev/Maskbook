import type { EVM_Provider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class WalletLinkProvider extends BaseInjectedProvider implements EVM_Provider {
    constructor() {
        super(['coinbaseWalletExtension'])
    }
}
