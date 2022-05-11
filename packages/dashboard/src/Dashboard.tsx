import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import(/* webpackPreload: true */ './initialization/Dashboard'))
export function IntegratedDashboard() {
    return (
        <Suspense fallback="">
            <Dashboard />
        </Suspense>
    )
}
