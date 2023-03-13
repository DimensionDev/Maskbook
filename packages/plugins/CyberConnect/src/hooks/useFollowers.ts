import { useMemo } from 'react'
import { pageableToIterator } from '@masknet/shared-base'
import { PluginCyberConnectRPC } from '../messages.js'
import type { ProfileTab } from '../constants.js'

export function useFollowers(tab: ProfileTab, address?: string, size = 50) {
    return useMemo(() => {
        if (!address) return
        return pageableToIterator(async (indicator) => {
            return PluginCyberConnectRPC.fetchFollowers(tab, address, size, indicator)
        })
    }, [address, tab, size])
}
