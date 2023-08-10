import { useCallback, useDeferredValue, useEffect, useState } from 'react'
import { Bars3Icon } from '@heroicons/react/20/solid'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { EmptyStatus, SearchResultInspector } from '@masknet/shared'
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { useLookupAddress } from '@masknet/web3-hooks-base'
import { DashboardContext } from '../contexts/DashboardContext.js'
import { useSetThemeMode, useThemeMode } from '../helpers/setThemeMode.js'
import { DashboardBody } from './DashboardBody.js'

export interface DashboardContainerProps {
    children: React.ReactNode
}

export function DashboardContainer(props: DashboardContainerProps) {
    const { children } = props
    const [search, setSearch] = useState('')
    const { value: registeredAddress = '' } = useLookupAddress(undefined, useDeferredValue(search))
    const keyword = registeredAddress || search
    const { setSidebarOpen } = DashboardContext.useContainer()
    const onChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setSearch(e.target.value),
        [],
    )
    const setThemeMode = useSetThemeMode()
    const mode = useThemeMode()

    useEffect(() => {
        setThemeMode(mode)
    }, [setThemeMode, mode])

    return (
        <div className="xl:pl-72 ">
            <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-line-light dark:border-neutral-800 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
                <button
                    type="button"
                    className="-m-2.5 p-2.5 dark:text-white text-black xl:hidden"
                    onClick={() => setSidebarOpen(true)}>
                    <span className="sr-only">Open sidebar</span>
                    <Bars3Icon className="h-5 w-5" aria-hidden="true" />
                </button>
                <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                    <label htmlFor="search-field" className="sr-only">
                        Search
                    </label>
                    <div className="relative w-full">
                        <MagnifyingGlassIcon
                            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-black dark:text-white"
                            aria-hidden="true"
                        />
                        <input
                            id="search-field"
                            className="dark:bg-black bg-white block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 dark:text-white text-black focus:ring-0 sm:text-sm"
                            placeholder="eg: Twitter accounts, Persona public keys, wallet addresses or ENS"
                            type="search"
                            name="search"
                            onChange={onChange}
                        />
                    </div>
                </div>
            </div>
            {keyword ? (
                <div className="h-(calc(100vh_-_64px)) overflow-auto lg:px-8">
                    <DashboardBody>
                        <DisableShadowRootContext.Provider value={false}>
                            <ShadowRootIsolation>
                                <SearchResultInspector
                                    keyword={keyword}
                                    empty={<EmptyStatus>No results</EmptyStatus>}
                                />
                            </ShadowRootIsolation>
                        </DisableShadowRootContext.Provider>
                    </DashboardBody>
                </div>
            ) : (
                <div className="lg:px-8">{children}</div>
            )}
        </div>
    )
}
