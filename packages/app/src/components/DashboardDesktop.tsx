import { env } from '@masknet/flags'
import { WalletItem } from './Wallet.js'
import { Navigation } from './Navigation.js'
import { InstallExtension } from './Install.js'

export interface SidebarForDesktopProps {}

export function DashboardForDesktop(props: SidebarForDesktopProps) {
    return (
        <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto dark:bg-black/10 bg-white/10 px-6 ring-1 dark:ring-white/10 ring-gray-400/20">
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
                            <span className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 dark:text-white text-black ">
                                {`Version: ${env.VERSION}`}
                            </span>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}
