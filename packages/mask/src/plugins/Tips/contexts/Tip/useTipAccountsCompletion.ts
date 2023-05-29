import { useEffect, useMemo, useState } from 'react'
import { useWeb3State } from '@masknet/web3-hooks-base'
import type { SocialAccount } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

/**
 * Add name service
 */
export function useTipAccountsCompletion(accounts: Array<SocialAccount<Web3Helper.ChainIdAll>>) {
    const [map, setMap] = useState<Record<string, string>>({})

    const { NameService } = useWeb3State()
    useEffect(() => {
        if (!NameService?.reverse) return
        accounts.forEach(async ({ address, label: originalName }) => {
            if (originalName) return

            const name = await NameService.reverse!(address)
            if (!name) return
            setMap((oldMap) => ({
                ...oldMap,
                [address]: name,
            }))
        })
    }, [accounts, NameService])

    return useMemo(() => {
        if (!Object.keys(map).length) return accounts
        return accounts.map((config) => ({
            ...config,
            name: config.label || map[config.address],
        }))
    }, [accounts, map])
}
