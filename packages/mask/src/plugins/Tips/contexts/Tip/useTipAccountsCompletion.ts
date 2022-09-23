import { useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
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
        tipAccounts.forEach(async ({ address, name }) => {
            if (name) return

            const ens = await NameService.reverse!(chainId, address)
            if (!ens) return
            setMap((oldMap) => ({
                ...oldMap,
                [address]: ens,
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
