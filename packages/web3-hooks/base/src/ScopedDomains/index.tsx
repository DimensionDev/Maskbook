import { useCallback, useState } from 'react'
import { createContainer } from 'unstated-next'

function useMap(initialState?: { defaultMap: Record<string, string> }) {
    const [map, setMap] = useState<Record<string, string>>({})

    const setPair = useCallback((address: string, domain: string) => {
        setMap((map) => {
            const key = address.toLowerCase()
            if (map[key] === domain || !domain.includes('.')) return map
            return { ...map, [key]: domain }
        })
    }, [])
    const getDomain = useCallback(
        (address: string) => {
            return initialState?.defaultMap?.[address.toLowerCase()] || map[address.toLowerCase()]
        },
        [map, initialState?.defaultMap],
    )

    return { setPair, getDomain, map }
}

export const ScopedDomainsContainer = createContainer(useMap)

ScopedDomainsContainer.Provider.displayName = 'ScopedDomainsContainer.Provider'
