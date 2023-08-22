import { memo } from 'react'
import { Link, useMatch } from 'react-router-dom'
import {
    ArrowPathRoundedSquareIcon,
    Cog6ToothIcon,
    WindowIcon,
    UserCircleIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline'
import {
    WindowIcon as WindowIconSolid,
    Cog6ToothIcon as Cog6ToothIconSolid,
    UserCircleIcon as UserCircleIconSolid,
    PencilSquareIcon as PencilSquareIconSolid,
    ArrowPathRoundedSquareIcon as ArrowPathRoundedSquareIconSolid,
} from '@heroicons/react/24/solid'
import { ApplicationRoutes } from '../constants/ApplicationRoutes.js'
import { classNames } from '../helpers/classNames.js'
import { DashboardContext } from '../contexts/DashboardContext.js'

const navigation = [
    { name: 'Applications', icon: WindowIcon, iconMatched: WindowIconSolid, to: ApplicationRoutes.Applications },
    { name: 'Compose', icon: PencilSquareIcon, iconMatched: PencilSquareIconSolid, to: ApplicationRoutes.Compose },
    { name: 'Web3 Profile', icon: UserCircleIcon, iconMatched: UserCircleIconSolid, to: ApplicationRoutes.Web3Profile },
    {
        name: 'Swap',
        icon: ArrowPathRoundedSquareIcon,
        iconMatched: ArrowPathRoundedSquareIconSolid,
        to: ApplicationRoutes.Swap,
    },
    { name: 'Settings', icon: Cog6ToothIcon, iconMatched: Cog6ToothIconSolid, to: ApplicationRoutes.Settings },
]

function NavigationLink(props: (typeof navigation)[0]) {
    const { name, to } = props
    const matched = useMatch(to)
    const { setSidebarOpen } = DashboardContext.useContainer()
    return (
        <li>
            <Link
                onClick={() => {
                    setSidebarOpen(false)
                }}
                to={to}
                className={classNames(
                    matched
                        ? 'dark:bg-menu-dark bg-menu-light dark:text-link-dark bg-menu text-blue-600'
                        : 'text-item-light dark:text-item-dark ',
                    'group flex gap-x-3 rounded-md px-2 py-3 text-md leading-6 font-semibold hover:bg-gray-200 dark:hover:bg-[#2d2d32]',
                )}>
                {matched ? (
                    <props.iconMatched className="h-6 w-6 shrink-0" aria-hidden="true" />
                ) : (
                    <props.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                )}
                {name}
            </Link>
        </li>
    )
}

export const Navigation = memo(() => {
    return (
        <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => (
                <NavigationLink key={item.name} {...item} />
            ))}
        </ul>
    )
})
