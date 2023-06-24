import { useState } from 'react'
import { MaskLightTheme } from '@masknet/theme'
import { PageUIProvider } from '@masknet/shared'
import { useMountReport } from '@masknet/web3-hooks-base'
import { EventID } from '@masknet/web3-telemetry/types'
// import { ActivityFeed } from './components/ActivityFeed.js'
import { DevelopmentList } from './components/DevelopmentList.js'
import { SortDropdown } from './components/SortDropdown.js'
import { StickySearchHeader } from './components/StickySearchBar.js'
import { SidebarForDesktop } from './components/SidebarForDesktop.js'
import { SidebarForMobile } from './components/SidebarForMobile.js'
import { DecryptUI } from './main/index.js'

function useTheme() {
    return MaskLightTheme
}

export function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useMountReport(EventID.AccessPopups)

    return PageUIProvider(
        useTheme,
        <div className="bg-zinc-900 h-full">
            <SidebarForMobile sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <SidebarForDesktop />

            <div className="xl:pl-72">
                <StickySearchHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="lg:pr-96">
                    <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                        <h1 className="text-base font-semibold leading-7 text-white">Deployments</h1>

                        <SortDropdown />
                    </header>

                    <DevelopmentList />
                </main>

                {/* <ActivityFeed /> */}

                <DecryptUI />
            </div>
        </div>,
    )
}
