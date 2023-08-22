import { env } from '@masknet/flags'
import { WalletItem } from './Wallet.js'
import { Navigation } from './Navigation.js'
import { InstallExtension } from './Install.js'

export interface SidebarForDesktopProps {}

export function DashboardForDesktop(props: SidebarForDesktopProps) {
    return (
        <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col bg-[#f5f5f7] dark:bg-[#1d1d21]">
            <div className="flex grow flex-col gap-y-2 overflow-y-auto bg-white/10 dark:bg-[#16161a]/10 px-6 border-r dark:border-neutral-800">
                <div className="flex h-16 shrink-0 items-center">
                    <WalletItem />
                </div>
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <Navigation />
                        </li>
                        <li className="-mx-6 mt-auto">
                            <InstallExtension />
                            <p className="flex items-center gap-x-4 px-6 py-3 text-xs leading-6 text-gray-700 dark:text-gray-400">
                                {`Version: ${env.VERSION}`}
                            </p>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}
