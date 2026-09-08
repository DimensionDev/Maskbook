import { PopupRoutes, relativeRouteOf } from '@masknet/shared-base'
import { Navigate, type RouteObject } from 'react-router-dom'

const r = relativeRouteOf(PopupRoutes.Friends)

export const contactsRoutes: RouteObject[] = [
    { index: true, lazy: () => import('./Home/index.js') },
    { path: `${r(PopupRoutes.FriendsDetail)}/:id?`, lazy: () => import('./Detail/index.js') },
    { path: '*', element: <Navigate to={PopupRoutes.Contacts} /> },
]
