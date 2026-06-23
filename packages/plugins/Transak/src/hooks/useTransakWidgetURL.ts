import { useMemo } from 'react'
import { useTheme } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { TRANSAK_PROXY_HOST } from '../constants.js'
import type { TransakConfig } from '../types.js'
import { buildTransakSearchParams } from './useTransakURL.js'

// Fetches a single-use, iframe-safe widgetUrl from the session proxy.
export function useTransakWidgetURL(config?: Partial<TransakConfig>) {
    const theme = useTheme()
    const url = useMemo(
        () => `${TRANSAK_PROXY_HOST}?${buildTransakSearchParams(config, theme).toString()}`,
        // eslint-disable-next-line react-compiler/react-compiler
        [theme.palette.primary.main, JSON.stringify(config)],
    )
    return useQuery({
        queryKey: ['transak', 'widget-url', url],
        queryFn: async () => {
            const res = await fetch(url)
            if (!res.ok) throw new Error('Failed to create a Transak session')
            const json = (await res.json()) as { data?: { widgetUrl?: string } }
            const widgetUrl = json.data?.widgetUrl
            if (!widgetUrl) throw new Error('Transak session did not return a widget URL')
            return widgetUrl
        },
        // widgetUrl is single-use (one sessionId, 5 min) — fetch once per open, never refetch or reuse.
        staleTime: Infinity,
        gcTime: 0,
    })
}
