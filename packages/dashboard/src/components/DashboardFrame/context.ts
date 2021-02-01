import { createContext } from 'react'

export interface DashboardState {
    expanded: boolean
    drawerOpen: boolean
    toggleNavigationExpand: () => void
    toggleDrawer: () => void
}
export const DashboardContextDefault = {
    expanded: true,
    drawerOpen: false,
    toggleDrawer: () => {},
    toggleNavigationExpand: () => {},
}

export const DashboardContext = createContext<DashboardState>(DashboardContextDefault)
