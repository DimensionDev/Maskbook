import { Suspense, lazy, useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { SNSAdaptorContextRef } from '@masknet/plugin-infra/content-script'
import { DashboardForDesktop } from './components/DashboardDesktop.js'
import { DashboardForMobile } from './components/DashboardMobile.js'
import { DashboardContext } from './contexts/DashboardContext.js'
import { ApplicationRoutes } from './constants/ApplicationRoutes.js'
import { createSharedContext } from './helpers/createSharedContext.js'
import ComposePage from './pages/ComposePage.js'

const OverviewPage = lazy(() => import(/* webpackPrefetch: true */ './pages/OverviewPage.js'))
const ExplorePage = lazy(() => import(/* webpackPrefetch: true */ './pages/ExplorePage.js'))
const SwapPage = lazy(() => import(/* webpackPrefetch: true */ './pages/SwapPage.js'))
const BridgePage = lazy(() => import(/* webpackPrefetch: true */ './pages/BridgePage.js'))
const SettingsPage = lazy(() => import(/* webpackPrefetch: true */ './pages/SettingsPage.js'))
const Web3ProfilePage = lazy(() => import(/* webpackPrefetch: true */ './pages/Web3Profile.js'))
const ApplicationsPage = lazy(() => import(/* webpackPrefetch: true */ './pages/ApplicationPage.js'))
const DSearchPage = lazy(() => import(/* webpackPrefetch: true */ './pages/DsearchPage.js'))

const PageInspectorRender = lazy(() => import('./main/page-render.js'))

export function MainUI() {
    useEffect(() => {
        SNSAdaptorContextRef.value = createSharedContext()
    }, [])

    return (
        <DashboardContext.Provider>
            <Suspense fallback={null}>
                <HashRouter>
                    <div className="bg-zinc-900 h-full">
                        <DashboardForMobile />
                        <DashboardForDesktop />

                        <Routes>
                            <Route path={`${ApplicationRoutes.Overview}/*`} element={<OverviewPage />} />
                            <Route path={`${ApplicationRoutes.Explorer}/*`} element={<ExplorePage />} />
                            <Route path={`${ApplicationRoutes.Swap}/*`} element={<SwapPage />} />
                            <Route path={`${ApplicationRoutes.Bridges}/*`} element={<BridgePage />} />
                            <Route path={`${ApplicationRoutes.Settings}/*`} element={<SettingsPage />} />
                            <Route path={`${ApplicationRoutes.DSearch}/*`} element={<DSearchPage />} />
                            <Route path={`${ApplicationRoutes.Applications}/*`} element={<ApplicationsPage />} />
                            <Route path={`${ApplicationRoutes.Web3Profile}/*`} element={<Web3ProfilePage />} />
                            <Route path={`${ApplicationRoutes.Compose}/*`} element={<ComposePage />} />
                            <Route path="*" element={<Navigate to={ApplicationRoutes.Explorer} />} />
                        </Routes>
                    </div>
                </HashRouter>

                <DisableShadowRootContext.Provider value={false}>
                    <ShadowRootIsolation>
                        <PageInspectorRender />
                    </ShadowRootIsolation>
                </DisableShadowRootContext.Provider>
            </Suspense>
        </DashboardContext.Provider>
    )
}
