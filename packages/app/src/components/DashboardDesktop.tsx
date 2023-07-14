import { Link, useMatch } from 'react-router-dom'
import {
    ArrowPathRoundedSquareIcon,
    Cog6ToothIcon,
    RocketLaunchIcon,
    HeartIcon,
    EyeIcon,
    TruckIcon,
    WindowIcon,
    UserCircleIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { SelectProviderModal, WalletStatusModal } from '@masknet/shared'
import { useChainContext, useNetworkContext, useWeb3Others } from '@masknet/web3-hooks-base'
import { classNames } from '../helpers/classNames.js'
import { ApplicationRoutes } from '../constants/ApplicationRoutes.js'

const navigation = [
    { name: 'Overview', icon: EyeIcon, to: ApplicationRoutes.Overview },
    { name: 'Explore', icon: RocketLaunchIcon, to: ApplicationRoutes.Explorer },
    { name: 'Favorites', icon: HeartIcon, to: ApplicationRoutes.Favorites },
    { name: 'Mask Network', icon: WindowIcon, to: ApplicationRoutes.Applications },
    { name: 'Web3 Profile', icon: UserCircleIcon, to: ApplicationRoutes.Web3Profile },
    { name: 'Swap', icon: ArrowPathRoundedSquareIcon, to: ApplicationRoutes.Swap },
    { name: 'Bridges', icon: TruckIcon, to: ApplicationRoutes.Bridges },
    { name: 'Settings', icon: Cog6ToothIcon, to: ApplicationRoutes.Settings },
    { name: 'Search', icon: MagnifyingGlassIcon, to: ApplicationRoutes.Search },
]

function NavigationLink(props: (typeof navigation)[0]) {
    const { name, to } = props
    const matched = useMatch(to)
    return (
        <li>
            <Link
                to={to}
                className={classNames(
                    matched ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800',
                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                )}>
                <props.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                {name}
            </Link>
        </li>
    )
}

export interface SidebarForDesktopProps {}

export function DashboardForDesktop(props: SidebarForDesktopProps) {
    const pluginID = useNetworkContext()
    const { account, chainId } = useChainContext()
    const Others = useWeb3Others()

    return (
        <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-6 ring-1 ring-white/5">
                <div className="flex h-16 shrink-0 items-center">
                    <img
                        className="h-8 w-auto"
                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                        alt="Your Company"
                    />
                </div>
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="-mx-2 space-y-1">
                                {navigation.map((item) => (
                                    <NavigationLink key={item.name} {...item} />
                                ))}
                            </ul>
                        </li>
                        <li className="-mx-6 mt-auto">
                            <a
                                href="#"
                                className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
                                onClick={(ev) => {
                                    ev.preventDefault()
                                    ev.stopPropagation()

                                    if (account) WalletStatusModal.open()
                                    else SelectProviderModal.open()
                                }}>
                                <img
                                    className="h-8 w-8 rounded-full bg-gray-800"
                                    src="https://github.com/DimensionDev/Mask-VI/raw/master/assets/Logo/MB--Logo--Geo--ForceCircle--Blue.svg"
                                    alt=""
                                />
                                <span className="sr-only">Your profile</span>
                                <span aria-hidden="true">
                                    {account ? Others.formatAddress(account, 4) : 'Connect Wallet'}
                                </span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}
