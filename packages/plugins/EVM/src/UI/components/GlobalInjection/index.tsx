import { ProviderType } from '@masknet/web3-shared-evm'
import { isDashboardPage, isPopupPage } from '@masknet/shared-base'
import { ProviderBridge } from '../ProviderBridge'

export function GlobalInjection() {
    const isPopup = isPopupPage()
    if (isPopup) return null

    const isDashboard = isDashboardPage()
    return (
        <>
            {isDashboard ? null : <ProviderBridge providerType={ProviderType.Coin98} />}
            <ProviderBridge providerType={ProviderType.MetaMask} />
            <ProviderBridge providerType={ProviderType.Fortmatic} />
            <ProviderBridge providerType={ProviderType.WalletConnect} />
        </>
    )
}
