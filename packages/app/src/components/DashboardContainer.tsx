import { Bars3Icon } from '@heroicons/react/20/solid'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { EmptyStatus, SearchResultInspector } from '@masknet/shared'
import { DisableShadowRootContext, ShadowRootIsolation, useSystemPreferencePalette } from '@masknet/theme'
import { useLookupAddress } from '@masknet/web3-hooks-base'
import { useCallback, useDeferredValue, useEffect, useState } from 'react'
import { DashboardContext } from '../contexts/DashboardContext.js'
import { setThemeMode } from '../helpers/setThemeMode.js'
import { Appearance } from '@masknet/public-api'

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
    const systemMode = useSystemPreferencePalette()
    useEffect(() => {
        setThemeMode(localStorage.themeMode ?? Appearance.default, systemMode)
    }, [systemMode, localStorage.themeMode])

    return (
        <div className="xl:pl-72 container">
            <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b dark:border-white/5  border-black/5 dark:bg-zinc-900 px-4  sm:px-6 lg:px-8 border">
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
                            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-500"
                            aria-hidden="true"
                        />
                        <input
                            id="search-field"
                            className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 dark:text-white text-black focus:ring-0 sm:text-sm"
                            placeholder="eg: Twitter accounts, Persona public keys, wallet addresses or ENS"
                            type="search"
                            name="search"
                            onChange={onChange}
                        />
                    </div>
                </div>
            </div>
            {keyword ? (
                <div className=" lg:px-8">
                    <div className="bg-white p-5">
                        <div className="border rounded-lg overflow-hidden">
                            <DisableShadowRootContext.Provider value={false}>
                                <ShadowRootIsolation>
                                    <SearchResultInspector
                                        keyword={keyword}
                                        empty={<EmptyStatus>No results</EmptyStatus>}
                                    />
                                </ShadowRootIsolation>
                            </DisableShadowRootContext.Provider>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="lg:px-8">{children}</div>
            )}
        </div>
    )
}
