import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { SearchResultInspector } from '@masknet/shared'
import { DisableShadowRootContext, ShadowRootIsolation } from '@masknet/theme'
import { useLookupAddress } from '@masknet/web3-hooks-base'
import { useCallback, useDeferredValue, useState } from 'react'

export interface DashboardContainerProps {
    children: React.ReactNode
}

export function DashboardContainer(props: DashboardContainerProps) {
    const { children } = props
    const [search, setSearch] = useState('')
    const { value: registeredAddress = '' } = useLookupAddress(undefined, useDeferredValue(search))
    const keyword = registeredAddress || search

    return (
        <div className="xl:pl-72">
            <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-white/5 bg-zinc-900 px-4 shadow-sm sm:px-6 lg:px-8">
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
                            className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white focus:ring-0 sm:text-sm"
                            placeholder="eg: Twitter accounts, Persona public keys, wallet addresses or ENS"
                            type="search"
                            name="search"
                            onChange={useCallback(
                                (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                                    setSearch(e.target.value),
                                [],
                            )}
                        />
                    </div>
                </div>
            </div>
            {keyword ? (
                <div className="bg-white p-5">
                    <div className="border p-4 rounded-lg">
                        <DisableShadowRootContext.Provider value={false}>
                            <ShadowRootIsolation>
                                <SearchResultInspector keyword={keyword} />
                            </ShadowRootIsolation>
                        </DisableShadowRootContext.Provider>
                    </div>
                </div>
            ) : (
                children
            )}
        </div>
    )
}
