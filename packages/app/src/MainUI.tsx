import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardForDesktop } from './components/DashboardDesktop.js'
import { DashboardForMobile } from './components/DashboardMobile.js'
import { DashboardContext } from './contexts/DashboardContext.js'
import { ApplicationRoutes } from './constants/ApplicationRoutes.js'

const ExplorerPage = lazy(() => import(/* webpackPrefetch: true */ './pages/ExplorerPage.js'))

export function MainUI() {
    return (
        <Suspense fallback={null}>
            <DashboardContext.Provider>
                <BrowserRouter>
                    <div className="bg-zinc-900 h-full">
                        <DashboardForMobile />
                        <DashboardForDesktop />

                        <Routes>
                            <Route path={`${ApplicationRoutes.Explorer}/*`} element={<ExplorerPage />} />
                            <Route path="*" element={<Navigate to={ApplicationRoutes.Explorer} />} />
                        </Routes>
                    </div>
                </BrowserRouter>
            </DashboardContext.Provider>
        </Suspense>
    )
}
