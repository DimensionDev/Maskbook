import type { PopupRoutes } from './PopupRoutes.js'
import type { DashboardRoutes } from './DashboardRoutes.js'

export { PopupRoutes } from './PopupRoutes.js'
export { DashboardRoutes } from './DashboardRoutes.js'
export { GlobalDialogRoutes } from './GlobalDialogRoutes.js'
export function relativeRouteOf(parent: PopupRoutes): (child: PopupRoutes) => string
export function relativeRouteOf(parent: DashboardRoutes): (child: DashboardRoutes) => string
export function relativeRouteOf(parent: PopupRoutes | DashboardRoutes) {
    return (child: string) => {
        if (!child.startsWith(parent)) throw new Error()
        return child.slice(parent.length).replace(/^\//, '')
    }
}
