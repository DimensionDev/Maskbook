import type { PopupRoutes } from './PopupRoutes.js'
import type { DashboardRoutes } from './DashboardRoutes.js'

export * from './PopupRoutes.js'
export * from './DashboardRoutes.js'
export * from './PopupModalRoutes.js'

export function relativeRouteOf(parent: PopupRoutes): (child: PopupRoutes) => string
export function relativeRouteOf(parent: DashboardRoutes): (child: DashboardRoutes) => string
export function relativeRouteOf(parent: PopupRoutes | DashboardRoutes) {
    return (child: string) => {
        if (!child.startsWith(parent)) throw new Error()
        return child.slice(parent.length).replace(/^\//, '')
    }
}
