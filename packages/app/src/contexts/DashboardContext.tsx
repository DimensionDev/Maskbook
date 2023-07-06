import { useState } from 'react'
import { createContainer } from 'unstated-next'

function useDashboardContext() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return {
        sidebarOpen,
        setSidebarOpen,
    }
}

export const DashboardContext = createContainer(useDashboardContext)
DashboardContext.Provider.displayName = 'DashboardContext'
