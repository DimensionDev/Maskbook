import { pageableToIterator } from '@masknet/web3-shared-base'
import { PluginCyberConnectRPC } from '../messages.js'
import type { ProfileTab } from '../constants.js'
import { useMemo } from 'react'

export function useFollowers(tab: ProfileTab, address?: string, size = 50) {
    return useMemo(() => {
        if (!address) return
        return pageableToIterator(async (indicator) => {
            return PluginCyberConnectRPC.fetchFollowers(tab, address, size, indicator)
        })
    }, [address, tab, size])
}
