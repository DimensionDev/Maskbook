import { initLogs } from '@masknet/shared-base'
import { lazy, Suspense } from 'react'

initLogs('dashboard')

const Dashboard = lazy(() => import(/* webpackPreload: true */ './initialization/Dashboard.js'))
export function IntegratedDashboard() {
    return (
        <Suspense fallback="">
            <Dashboard />
        </Suspense>
    )
}
