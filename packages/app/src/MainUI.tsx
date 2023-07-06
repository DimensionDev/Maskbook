import { Suspense, lazy } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardForDesktop } from './components/DashboardDesktop.js'
import { DashboardForMobile } from './components/DashboardMobile.js'
import { DashboardContext } from './contexts/DashboardContext.js'
import { ApplicationRoutes } from './constants/ApplicationRoutes.js'

const OverviewPage = lazy(() => import(/* webpackPrefetch: true */ './pages/OverviewPage.js'))
const ExplorerPage = lazy(() => import(/* webpackPrefetch: true */ './pages/ExplorerPage.js'))
const SwapPage = lazy(() => import(/* webpackPrefetch: true */ './pages/SwapPage.js'))

export function MainUI() {
    return (
        <DashboardContext.Provider>
            <Suspense fallback={null}>
                <HashRouter>
                    <div className="bg-zinc-900 h-full">
                        <DashboardForMobile />
                        <DashboardForDesktop />

                        <Routes>
                            <Route path={`${ApplicationRoutes.Overview}/*`} element={<OverviewPage />} />
                            <Route path={`${ApplicationRoutes.Explorer}/*`} element={<ExplorerPage />} />
                            <Route path={`${ApplicationRoutes.Swap}/*`} element={<SwapPage />} />
                            <Route path="*" element={<Navigate to={ApplicationRoutes.Explorer} />} />
                        </Routes>
                    </div>
                </HashRouter>
            </Suspense>
        </DashboardContext.Provider>
    )
}
