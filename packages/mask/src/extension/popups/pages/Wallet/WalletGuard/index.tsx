import { useWallet, useWallets } from '@masknet/web3-hooks-base'
import { memo } from 'react'
import { Outlet, useOutletContext } from 'react-router-dom'
import { WalletStartUp } from '../components/StartUp/index.js'
import { WalletHeader } from '../components/WalletHeader/index.js'
import { usePaymentPasswordGuard } from './usePaymentPasswordGuard.js'
import { useMessageGuard } from './useMessageGuard.js'
import { useWalletLockStatus } from '../hooks/index.js'
import Unlock from '../Unlock/index.js'
import { WalletSetupHeaderUI } from '../components/WalletHeader/WalletSetupHeaderUI.js'

export const WalletGuard = memo(function WalletGuard() {
    const wallet = useWallet()
    const wallets = useWallets()
    const outletContext = useOutletContext()
    const { isLocked, loading } = useWalletLockStatus()

    usePaymentPasswordGuard()
    useMessageGuard()

    if (isLocked && !loading) {
        return (
            <>
                <WalletSetupHeaderUI />
                <Unlock />
            </>
        )
    }

    return (
        <>
            <WalletHeader />
            {!wallet || !wallets.length ? <WalletStartUp /> : <Outlet context={outletContext} />}
        </>
    )
})
