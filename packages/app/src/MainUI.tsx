import { Suspense, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { StickySearchHeader } from './components/StickySearchBar.js'
import { DashboardForDesktop } from './components/DashboardDesktop.js'
import { DashboardForMobile } from './components/DashboardMobile.js'
import { DecryptMessage } from './main/index.js'
import { DashboardHeader } from './components/DashboardHeader.js'
import { DashboardContainer } from './components/DashboardContainer.js'

export function MainUI() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <Suspense fallback={null}>
            <BrowserRouter>
                <div className="bg-zinc-900 h-full">
                    <DashboardForMobile sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <DashboardForDesktop />

                    <DashboardContainer>
                        <StickySearchHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                        <main>
                            <DashboardHeader title="Deployments" />

                            <div className="bg-white p-5">
                                <div className="border pt-3 rounded-lg">
                                    <DecryptMessage />
                                </div>
                            </div>
                        </main>
                    </DashboardContainer>
                </div>
            </BrowserRouter>
        </Suspense>
    )
}
