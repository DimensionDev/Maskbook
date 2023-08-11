import { useDeferredValue, useLayoutEffect, useState } from 'react'
import { Bars3Icon } from '@heroicons/react/20/solid'
import { EmptyStatus, SearchResultInspector } from '@masknet/shared'
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { useLookupAddress } from '@masknet/web3-hooks-base'
import { DashboardContext } from '../contexts/DashboardContext.js'
import { DashboardBody } from './DashboardBody.js'
import { DashboardHeader } from './DashboardHeader.js'
import { SearchBox } from './SearchBox.js'
import { useSetThemeMode } from '../hooks/useSetThemeMode.js'
import { useThemeMode } from '../hooks/useThemeMode.js'

export interface DashboardContainerProps {
    children: React.ReactNode
}

export function DashboardContainer(props: DashboardContainerProps) {
    const { children } = props
    const [search, setSearch] = useState('')
    const { value: registeredAddress = '' } = useLookupAddress(undefined, useDeferredValue(search))
    const keyword = registeredAddress || search

    const { setSidebarOpen } = DashboardContext.useContainer()

    const mode = useThemeMode()
    const setThemeMode = useSetThemeMode()

    useLayoutEffect(() => {
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
                <SearchBox onChange={(keyword) => setSearch(keyword)} />
            </div>
            {keyword ? (
                <div className="h-[calc(100vh_-_64px)] overflow-auto lg:px-8">
                    <DashboardHeader title="DSearch" />
                    <DashboardBody>
                        <DisableShadowRootContext.Provider value={false}>
                            <ShadowRootIsolation>
                                <SearchResultInspector
                                    maxHeight="fix-content"
                                    keyword={keyword}
                                    empty={<EmptyStatus>No results</EmptyStatus>}
                                />
                            </ShadowRootIsolation>
                        </DisableShadowRootContext.Provider>
                    </DashboardBody>
                </div>
            ) : (
                <div className="h-[calc(100vh_-_64px)] overflow-auto lg:px-8">{children}</div>
            )}
        </div>
    )
}
