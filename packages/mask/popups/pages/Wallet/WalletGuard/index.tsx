import { memo } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { ChainContextProvider, useAccount, useFireflyEmbeddedWallets } from '@masknet/web3-hooks-base'
import { LoadingPlaceholder } from '../../../components/LoadingPlaceholder/index.js'
import { ConnectWalletEmptyState } from '../components/ConnectWalletEmptyState/index.js'
import { WalletHeader } from '../components/WalletHeader/index.js'
import { useMessageGuard } from './useMessageGuard.js'
import { InteractionWalletContext, useInteractionWalletContext } from '../Interaction/InteractionContext.js'

export const WalletGuard = memo(function WalletGuard() {
    const account = useAccount()
    const { wallets: fireflyWallets, ready } = useFireflyEmbeddedWallets()
    const hitMessageGuard = useMessageGuard()

    if (!ready) return <LoadingPlaceholder />
    if (!account && !fireflyWallets.length) return <ConnectWalletEmptyState />
    if (hitMessageGuard) return <Navigate to={PopupRoutes.ContractInteraction} />

    return (
        <InteractionWalletContext>
            <WalletGuardContent />
        </InteractionWalletContext>
    )
})

function WalletGuardContent() {
    const { interactionWallet } = useInteractionWalletContext()
    return (
        <ChainContextProvider account={interactionWallet}>
            <WalletHeader />
            <Outlet />
        </ChainContextProvider>
    )
}
