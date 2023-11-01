import { memo } from 'react'
import { Outlet, useOutletContext } from 'react-router-dom'
import { WalletHeader } from '../components/WalletHeader/index.js'

export const NoWalletGuard = memo(function NoWalletGuard() {
    const outletContext = useOutletContext()
    return (
        <>
            <WalletHeader />
            <Outlet context={outletContext} />
        </>
    )
})
