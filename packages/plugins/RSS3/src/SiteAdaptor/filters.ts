import { ValueRef } from '@masknet/shared-base'
import { Networks } from '../constants.js'
import { useValueRef } from '@masknet/shared-base-ui'
import { useCallback } from 'react'

export interface Filters {
    networks: typeof Networks
    isDirect: boolean
}

const filtersRef = new ValueRef<Filters>({ networks: Networks, isDirect: true })

// TODO: should be a context instead of a global state
export function useFilters() {
    const filters = useValueRef(filtersRef)
    const setFilters = useCallback((val: Filters | ((v: Filters) => Filters)) => {
        // eslint-disable-next-line react-compiler/react-compiler
        filtersRef.value = typeof val === 'function' ? val(filtersRef.value) : val
    }, [])

    return [filters, setFilters] as const
}
