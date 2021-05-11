import { lazy, Suspense } from 'react'
import { DashboardBase } from './initialization/Dashboard'

const Pages = lazy(() => import('./pages/routes').then((x) => ({ default: x.Pages })))
export function IntergratedDashboard() {
    return (
        <DashboardBase>
            <Suspense fallback="">
                <Pages />
            </Suspense>
        </DashboardBase>
    )
}
