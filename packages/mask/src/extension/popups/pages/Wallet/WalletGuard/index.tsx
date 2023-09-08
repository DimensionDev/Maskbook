import { memo } from 'react'
import { useWallet, useWallets } from '@masknet/web3-hooks-base'
import { WalletStartUp } from '../components/StartUp/index.js'
import { Outlet, useOutletContext } from 'react-router-dom'
import { WalletHeader } from '../components/WalletHeader/index.js'

export const WalletGuard = memo(function WalletGuard() {
    const wallet = useWallet()
    const wallets = useWallets()
    const outletContext = useOutletContext()
    return (
        <>
            <WalletHeader />
            {!wallet || !wallets.length ? <WalletStartUp /> : <Outlet context={outletContext} />}
        </>
    )
})
