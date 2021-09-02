import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./initialization/Dashboard'))
export function IntegratedDashboard() {
    return (
        <Suspense fallback="">
            <Dashboard />
        </Suspense>
    )
}
