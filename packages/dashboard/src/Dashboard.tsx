import { lazy } from 'react'

const Dashboard = lazy(() => import(/* webpackPreload: true */ './initialization/Dashboard.js'))
export function IntegratedDashboard(props: React.PropsWithChildren<{}>) {
    return <Dashboard {...props} />
}
