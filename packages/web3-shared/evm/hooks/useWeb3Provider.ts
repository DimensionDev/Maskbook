import { useMemo } from 'react'
import { useWeb3Context } from '../context'
import type { RequestOptions, SendOverrides } from '../types'
import { createExternalProvider } from '../utils'

export function useWeb3Provider(overrides?: SendOverrides, options?: RequestOptions) {
    const { request, getSendOverrides, getRequestOptions } = useWeb3Context()
    return useMemo(() => {
        return createExternalProvider(
            request,
            () => ({
                ...getSendOverrides?.(),
                ...overrides,
            }),
            () => ({
                ...getRequestOptions?.(),
                ...options,
            }),
        )
    }, [request, getSendOverrides, getRequestOptions, JSON.stringify(overrides), JSON.stringify(options)])
}
