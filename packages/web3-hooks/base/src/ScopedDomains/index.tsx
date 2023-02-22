import { createContainer } from 'unstated-next'
import { useCallback, useState } from 'react'

function useMap() {
    const [map, setMap] = useState<Record<string, string>>({})

    const setPair = useCallback((address: string, domain: string) => {
        setMap((map) => {
            const key = address.toLowerCase()
            if (map[key] === domain) return map
            return { ...map, [key]: domain }
        })
    }, [])
    const getDomain = useCallback(
        (address: string) => {
            return map[address.toLowerCase()]
        },
        [map],
    )

    return { setPair, getDomain }
}

export const ScopedDomainsContainer = createContainer(useMap)

ScopedDomainsContainer.Provider.displayName = 'ScopedDomainsContainer.Provider'
