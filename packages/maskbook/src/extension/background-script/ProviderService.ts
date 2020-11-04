import { OnlyRunInContext } from '@dimensiondev/holoflows-kit/es'
import { openOptionsPage } from './WelcomeService'
import { DashboardRoute } from '../options-page/Route'

OnlyRunInContext(['background', 'debugging'], 'ProviderService')

export function requestConnectWallet() {
    return openOptionsPage(DashboardRoute.Wallets, 'error=nowallet')
}
