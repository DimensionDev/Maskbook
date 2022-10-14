import { useChainId, useWeb3State } from '@masknet/web3-hooks-base'
import { useEffect, useMemo, useState } from 'react'
import type { TipsAccount } from '../../types/index.js'

/**
 * Add name service
 */
export function useTipAccountsCompletion(tipAccounts: TipsAccount[]) {
    const [map, setMap] = useState<Record<string, string>>({})

    const { NameService } = useWeb3State()
    const chainId = useChainId()
    useEffect(() => {
        if (!NameService?.reverse) return
        tipAccounts.forEach(async ({ address, name: originalName }) => {
            if (originalName || !chainId) return

            const name = await NameService.reverse!(chainId, address)
            if (!name) return
            setMap((oldMap) => ({
                ...oldMap,
                [address]: name,
            }))
        })
    }, [chainId, tipAccounts, NameService])

    return useMemo(() => {
        if (!Object.keys(map).length) return tipAccounts
        return tipAccounts.map((config) => ({
            ...config,
            name: config.name || map[config.address],
        }))
    }, [tipAccounts, map])
}
