import { ValueRef } from '@masknet/shared-base'
import { Networks } from '../constants.js'
import { useValueRef } from '@masknet/shared-base-ui'
import { useCallback } from 'react'

export interface Filters {
    networks: typeof Networks
    isDirect: boolean
}

const filtersRef = new ValueRef<Filters>({ networks: Networks, isDirect: false })

export function useFilters() {
    const filters = useValueRef(filtersRef)
    const setFilters = useCallback((val: Filters | ((v: Filters) => Filters)) => {
        filtersRef.value = typeof val === 'function' ? val(filtersRef.value) : val
    }, [])

    return [filters, setFilters] as const
}
