import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { RestorableScrollContext } from '@masknet/shared'
import { LoadingPlaceholder } from '@masknet/injected-ui/LoadingPlaceholder'

export function WalletFrame() {
    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <RestorableScrollContext>
                <Outlet />
            </RestorableScrollContext>
        </Suspense>
    )
}
