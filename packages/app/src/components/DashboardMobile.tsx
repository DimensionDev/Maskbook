import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { DashboardContext } from '../contexts/DashboardContext.js'
import { WalletItem } from './Wallet.js'
import { Navigation } from './Navigation.js'
import { InstallExtension } from './Install.js'
import { env } from '@masknet/flags'

export interface DashboardForMobileProps {}

export function DashboardForMobile(props: DashboardForMobileProps) {
    const { sidebarOpen, setSidebarOpen } = DashboardContext.useContainer()

    return (
        <Transition.Root show={sidebarOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50 xl:hidden" onClose={setSidebarOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="transition-opacity ease-linear duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease-linear duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-zinc-900/80" />
                </Transition.Child>

                <div className="fixed inset-0 flex">
                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-in-out duration-300 transform"
                        enterFrom="-translate-x-full"
                        enterTo="translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full">
                        <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-in-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in-out duration-300"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0">
                                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                    <button
                                        type="button"
                                        className="-m-2.5 p-2.5"
                                        onClick={() => setSidebarOpen(false)}>
                                        <span className="sr-only">Close sidebar</span>
                                        <XMarkIcon className="h-6 w-6 dark:text-white text-black" aria-hidden="true" />
                                    </button>
                                </div>
                            </Transition.Child>
                            {/* Sidebar component, swap this element with another sidebar if you like */}
                            <div className="flex grow flex-col gap-y-5 overflow-y-auto dark:bg-black bg-white px-6 ring-1 ring-line-light dark:ring-line-dark">
                                <div className="flex h-16 shrink-0 items-center">
                                    <WalletItem />
                                </div>
                                <nav className="flex flex-1 flex-col">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-7  justify-between">
                                        <li>
                                            <Navigation />
                                        </li>
                                        <li>
                                            <InstallExtension />
                                            <span className="flex items-center gap-x-4 px-6 py-3 text-xs leading-6 text-gray-700 dark:text-gray-400">
                                                {`Version: ${env.VERSION}`}
                                            </span>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
