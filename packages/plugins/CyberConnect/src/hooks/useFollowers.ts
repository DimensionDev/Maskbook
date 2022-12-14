import { useCallback, useMemo, useState } from 'react'
import { EMPTY_LIST } from '@masknet/shared-base'
import { pageableToIterator } from '@masknet/web3-shared-base'
import { PluginCyberConnectRPC } from '../messages.js'
import { PageSize, ProfileTab } from '../constants.js'

export function useFollowers(tab: ProfileTab, address?: string, size = 50) {
    return useMemo(() => {
        if (!address) return
        return pageableToIterator(async (indicator) => {
            return PluginCyberConnectRPC.fetchFollowers(tab, address, size, indicator)
        })
    }, [address, tab, size])
}
