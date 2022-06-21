import { useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import { useEffect, useMemo, useState } from 'react'
import type { AddressConfig } from '../../types'

export function useAddNameService(addressConfigs: AddressConfig[]) {
    const [map, setMap] = useState<Record<string, string>>({})

    const { NameService } = useWeb3State()
    const chainId = useChainId()
    useEffect(() => {
        if (!NameService?.reverse) return
        addressConfigs.forEach(async ({ address }) => {
            const name = await NameService.reverse!(chainId, address)
            if (!name) return
            setMap((oldMap) => ({
                ...oldMap,
                [address]: name,
            }))
        })
    }, [addressConfigs, NameService])

    return useMemo(() => {
        if (!Object.keys(map).length) return addressConfigs
        return addressConfigs.map((config) => ({
            ...config,
            name: map[config.address] || config.name,
        }))
    }, [addressConfigs, map])
}
