import { OnlyRunInContext } from '@holoflows/kit/es'
import { openOptionsPage } from './WelcomeService'

OnlyRunInContext(['background', 'debugging'], 'ProviderService')

export function requestConnectWallet() {
    return openOptionsPage('/wallets?error=nowallet')
}
