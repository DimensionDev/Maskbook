import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./initialization/Dashboard'))
export function IntergratedDashboard() {
    return (
        <Suspense fallback="">
            <Dashboard />
        </Suspense>
    )
}
