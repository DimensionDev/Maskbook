import { useState } from 'react'
import { StickySearchHeader } from './components/StickySearchBar.js'
import { DashboardForDesktop } from './components/DashboardDesktop.js'
import { DashboardForMobile } from './components/DashboardMobile.js'
import { DecryptMessage } from './main/index.js'

export function MainUI() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    return (
        <div className="bg-zinc-900 h-full">
            <DashboardForMobile sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <DashboardForDesktop />

            <div className="xl:pl-72">
                <StickySearchHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main>
                    <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                        <h1 className="text-base font-semibold leading-7 text-white">Deployments</h1>
                    </header>

                    <div className="bg-white p-5">
                        <div className="border pt-3 rounded-lg">
                            <DecryptMessage />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
