import { useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import { useEffect, useMemo, useState } from 'react'
import type { TipAccount } from '../../types'

export function useAddNameService(tipAccounts: TipAccount[]) {
    const [map, setMap] = useState<Record<string, string>>({})

    const { NameService } = useWeb3State()
    const chainId = useChainId()
    useEffect(() => {
        if (!NameService?.reverse) return
        tipAccounts.forEach(async ({ address }) => {
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
            name: map[config.address] || config.name,
        }))
    }, [tipAccounts, map])
}
