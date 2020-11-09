import { openOptionsPage } from './WelcomeService'
import { DashboardRoute } from '../options-page/Route'
import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
assertEnvironment(Environment.ManifestBackground)

export function requestConnectWallet() {
    return openOptionsPage(DashboardRoute.Wallets, 'error=nowallet')
}
