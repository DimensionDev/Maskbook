import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SiteAdaptorContextRef } from '@masknet/plugin-infra/content-script'
import { DashboardForDesktop } from './components/DashboardDesktop.js'
import { DashboardForMobile } from './components/DashboardMobile.js'
import { DashboardContext } from './contexts/DashboardContext.js'
import { ApplicationRoutes } from './constants/ApplicationRoutes.js'
import { createSharedContext } from './helpers/createSharedContext.js'
import ComposePage from './pages/ComposePage.js'
import { Spinner } from './components/Spinner.js'

const SwapPage = lazy(() => import(/* webpackPrefetch: true */ './pages/SwapPage.js'))
const SettingsPage = lazy(() => import(/* webpackPrefetch: true */ './pages/SettingsPage.js'))
const Web3ProfilePage = lazy(() => import(/* webpackPrefetch: true */ './pages/Web3Profile.js'))
const ApplicationsPage = lazy(() => import(/* webpackPrefetch: true */ './pages/ApplicationPage.js'))
const DebugPage = lazy(() => import(/* webpackPrefetch: true */ './pages/DebugPage.js'))

const PageInspectorRender = lazy(() => import('./main/page-render.js'))

export function MainUI() {
    useEffect(() => {
        SiteAdaptorContextRef.value = createSharedContext()
    }, [])

    return (
        <DashboardContext.Provider>
            <BrowserRouter>
                <div className="bg-white dark:bg-[#16161a] h-full">
                    <DashboardForMobile />
                    <DashboardForDesktop />
                    <Suspense
                        fallback={
                            <div className="pl-72 h-full flex items-center justify-center">
                                <Spinner />
                            </div>
                        }>
                        <Routes>
                            <Route path={`${ApplicationRoutes.Swap}/*`} element={<SwapPage />} />
                            <Route path={`${ApplicationRoutes.Settings}/*`} element={<SettingsPage />} />
                            <Route path={`${ApplicationRoutes.Applications}/*`} element={<ApplicationsPage />} />
                            <Route path={`${ApplicationRoutes.Web3Profile}/*`} element={<Web3ProfilePage />} />
                            <Route path={`${ApplicationRoutes.Compose}/*`} element={<ComposePage />} />
                            {process.env.NODE_ENV === 'development' ? (
                                <Route path={`${ApplicationRoutes.Debug}/*`} element={<DebugPage />} />
                            ) : null}
                            <Route path="*" element={<Navigate to={ApplicationRoutes.Compose} />} />
                        </Routes>
                    </Suspense>
                </div>
            </BrowserRouter>
            <PageInspectorRender />
        </DashboardContext.Provider>
    )
}
