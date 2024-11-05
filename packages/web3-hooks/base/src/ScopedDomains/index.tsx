import { useCallback, useMemo, useState } from 'react'
import { createContainer } from '@masknet/shared-base-ui'
import { EMPTY_OBJECT } from '@masknet/shared-base'

function useMap(initialState?: Record<string, string>) {
    const [updatedMap, setUpdatedMap] = useState<Record<string, string>>(EMPTY_OBJECT)

    const setPair = useCallback((address: string, domain: string) => {
        setUpdatedMap((map) => {
            const key = address.toLowerCase()
            if (map?.[key] === domain || !domain.includes('.')) return map
            return { ...map, [key]: domain }
        })
    }, [])

    const map = useMemo(() => {
        return { ...initialState, ...updatedMap }
    }, [initialState, updatedMap])

    const getDomain = useCallback(
        (address: string) => {
            return map[address.toLowerCase()]
        },
        [map],
    )

    return { setPair, getDomain, map }
}

export const ScopedDomainsContainer = createContainer(useMap)

ScopedDomainsContainer.Provider.displayName = 'ScopedDomainsContainer.Provider'
