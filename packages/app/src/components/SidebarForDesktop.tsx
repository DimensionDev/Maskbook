import { ArrowPathRoundedSquareIcon, Cog6ToothIcon, RocketLaunchIcon, HeartIcon } from '@heroicons/react/24/outline'
import { SelectProviderModal } from '@masknet/shared'
import { useChainContext, useNetworkContext, useWeb3Others } from '@masknet/web3-hooks-base'
import { classNames } from '../helpers/classNames.js'

const navigation = [
    { name: 'Explore', href: '#', icon: RocketLaunchIcon, current: false },
    { name: 'Favorites', href: '#', icon: HeartIcon, current: true },
    { name: 'Trade', href: '#', icon: ArrowPathRoundedSquareIcon, current: false },
    { name: 'Settings', href: '#', icon: Cog6ToothIcon, current: false },
]

const teams = [
    { id: 1, name: 'Planetaria', href: '#', initial: 'P', current: false },
    { id: 2, name: 'Protocol', href: '#', initial: 'P', current: false },
    { id: 3, name: 'Tailwind Labs', href: '#', initial: 'T', current: false },
]

export interface SidebarForDesktopProps {}

export function SidebarForDesktop(props: SidebarForDesktopProps) {
    const pluginID = useNetworkContext()
    const { account, chainId } = useChainContext()
    const Others = useWeb3Others()

    return (
        <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
            {/* Sidebar component, swap this element with another sidebar if you like */}
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
                                    <li key={item.name}>
                                        <a
                                            href={item.href}
                                            className={classNames(
                                                item.current
                                                    ? 'bg-gray-800 text-white'
                                                    : 'text-gray-400 hover:text-white hover:bg-gray-800',
                                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                                            )}>
                                            <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                            {item.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </li>
                        <li>
                            <div className="text-xs font-semibold leading-6 text-gray-400">Shortcuts</div>
                            <ul role="list" className="-mx-2 mt-2 space-y-1">
                                {teams.map((team) => (
                                    <li key={team.name}>
                                        <a
                                            href={team.href}
                                            className={classNames(
                                                team.current
                                                    ? 'bg-gray-800 text-white'
                                                    : 'text-gray-400 hover:text-white hover:bg-gray-800',
                                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                                            )}>
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                                                {team.initial}
                                            </span>
                                            <span className="truncate">{team.name}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </li>
                        <li className="-mx-6 mt-auto">
                            <a
                                href="#"
                                className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"
                                onClick={() => {
                                    console.log('DEBUG: open')

                                    SelectProviderModal.open()
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
