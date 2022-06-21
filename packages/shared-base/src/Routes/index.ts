import type { PopupRoutes } from './PopupRoutes'
import type { DashboardRoutes } from './DashboardRoutes'
import type { ApplicationBoardRoutes } from './ApplicationBoardRoutes'

export { PopupRoutes } from './PopupRoutes'
export { DashboardRoutes } from './DashboardRoutes'
export { ApplicationBoardRoutes } from './ApplicationBoardRoutes'
export function relativeRouteOf(parent: ApplicationBoardRoutes): (child: ApplicationBoardRoutes) => string
export function relativeRouteOf(parent: PopupRoutes): (child: PopupRoutes) => string
export function relativeRouteOf(parent: DashboardRoutes): (child: DashboardRoutes) => string
export function relativeRouteOf(parent: ApplicationBoardRoutes | PopupRoutes | DashboardRoutes) {
    return (child: string) => {
        if (!child.startsWith(parent)) throw new Error()
        return child.slice(parent.length).replace(/^\//, '')
    }
}
