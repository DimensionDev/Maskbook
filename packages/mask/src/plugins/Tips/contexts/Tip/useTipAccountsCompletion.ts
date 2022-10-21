import { useEffect, useMemo, useState } from 'react'
import { useChainContext, useWeb3State } from '@masknet/web3-hooks-base'
import type { SocialAccount } from '@masknet/web3-shared-base'

/**
 * Add name service
 */
export function useTipAccountsCompletion(accounts: SocialAccount[]) {
    const [map, setMap] = useState<Record<string, string>>({})

    const { NameService } = useWeb3State()
    const { chainId } = useChainContext()
    useEffect(() => {
        if (!NameService?.reverse) return
        accounts.forEach(async ({ address, label: originalName }) => {
            if (originalName) return

            const name = await NameService.reverse!(chainId, address)
            if (!name) return
            setMap((oldMap) => ({
                ...oldMap,
                [address]: name,
            }))
        })
    }, [chainId, accounts, NameService])

    return useMemo(() => {
        if (!Object.keys(map).length) return accounts
        return accounts.map((config) => ({
            ...config,
            name: config.label || map[config.address],
        }))
    }, [accounts, map])
}
