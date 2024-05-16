import { memo } from 'react'
import { WalletHeader } from '../components/WalletHeader/index.js'
import { Outlet } from 'react-router-dom'

export const NoWalletGuard = memo(function NoWalletGuard() {
    return (
        <>
            <WalletHeader />
            <Outlet />
        </>
    )
})
