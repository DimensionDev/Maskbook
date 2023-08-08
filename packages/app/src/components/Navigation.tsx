import {
    ArrowPathRoundedSquareIcon,
    Cog6ToothIcon,
    RocketLaunchIcon,
    WindowIcon,
    UserCircleIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { ApplicationRoutes } from '../constants/ApplicationRoutes.js'
import { memo } from 'react'
import { Link, useMatch } from 'react-router-dom'
import { classNames } from '../helpers/classNames.js'
import { DashboardContext } from '../contexts/DashboardContext.js'

const navigation = [
    { name: 'Mask Network', icon: WindowIcon, to: ApplicationRoutes.Applications },
    { name: 'Compose', icon: PencilSquareIcon, to: ApplicationRoutes.Compose },
    { name: 'Explore', icon: RocketLaunchIcon, to: ApplicationRoutes.Explorer },
    { name: 'Web3 Profile', icon: UserCircleIcon, to: ApplicationRoutes.Web3Profile },
    { name: 'Swap', icon: ArrowPathRoundedSquareIcon, to: ApplicationRoutes.Swap },
    { name: 'Settings', icon: Cog6ToothIcon, to: ApplicationRoutes.Settings },
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
                        ? 'bg-gray-800 text-white'
                        : 'text-black dark:text-white hover:text-white hover:bg-gray-800',
                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                )}>
                <props.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
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
