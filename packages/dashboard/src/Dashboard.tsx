import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import(/* webpackPreload: true */ './initialization/Dashboard.js'))
export function IntegratedDashboard() {
    return (
        <Suspense fallback="">
            <Dashboard />
        </Suspense>
    )
}
