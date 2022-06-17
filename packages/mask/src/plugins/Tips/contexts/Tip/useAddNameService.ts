import { useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import { useEffect, useMemo, useState } from 'react'
import type { AddressConfig } from '../../types'

export function useAddNameService(addressConfigs: AddressConfig[]) {
    const [map, setMap] = useState<Record<string, string>>({})

    const { NameService } = useWeb3State()
    const chainId = useChainId()
    useEffect(() => {
        if (!NameService?.reverse) return
        addressConfigs
            .map((x) => x.address)
            .forEach(async (addr) => {
                const name = await NameService.reverse!(chainId, addr)
                if (!name) return
                setMap((oldMap) => ({
                    ...oldMap,
                    [addr]: name,
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
