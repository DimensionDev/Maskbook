import { useWallet, useWallets } from '@masknet/web3-hooks-base'
import { useQuery } from '@tanstack/react-query'
import { memo, useEffect } from 'react'
import { Outlet, useOutletContext } from 'react-router-dom'
import Services from '../../../../../../shared-ui/service.js'
import { WalletStartUp } from '../components/StartUp/index.js'
import { WalletHeader } from '../components/WalletHeader/index.js'

export const WalletGuard = memo(function WalletGuard() {
    const wallet = useWallet()
    const wallets = useWallets()
    const outletContext = useOutletContext()
    const { data: hasPassword, refetch } = useQuery(['@@has-password'], Services.Wallet.hasPassword)
    useEffect(() => {
        refetch()
    }, [location.pathname])
    return (
        <>
            <WalletHeader />
            {!wallet || !wallets.length || !hasPassword ? <WalletStartUp /> : <Outlet context={outletContext} />}
        </>
    )
})
