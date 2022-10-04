import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { isSameAddress, isGreaterThan, NetworkPluginID } from '@masknet/web3-shared-base'
import { uniqBy } from 'lodash-unified'
import { useEffect, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { MaskMessages } from '../../../utils/index.js'
import type { TipsAccount } from '../types/index.js'

export function usePublicWallets(personaPubkey?: string, defaultAddress?: string): TipsAccount[] {
    const { value: nextIdWallets, retry: queryWallets } = useAsyncRetry(async (): Promise<TipsAccount[]> => {
        if (!personaPubkey) return EMPTY_LIST

        const bindings = await NextIDProof.queryExistedBindingByPersona(personaPubkey, true)
        if (!bindings) return EMPTY_LIST

        const wallets: TipsAccount[] = bindings.proofs
            .filter((p) => p.platform === NextIDPlatform.Ethereum)
            .map(
                (p): TipsAccount => ({
                    pluginId: NetworkPluginID.PLUGIN_EVM,
                    address: p.identity,
                    verified: true,
                    last_checked_at: p.last_checked_at,
                }),
            )
        return wallets
    }, [personaPubkey])

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(() => {
            queryWallets()
        })
    }, [])

    return useMemo(() => {
        const result: TipsAccount[] =
            nextIdWallets?.sort((a, z) => {
                if (!a.last_checked_at || !z.last_checked_at) return 1
                if (isGreaterThan(a.last_checked_at, z.last_checked_at)) {
                    return isSameAddress(z.address, defaultAddress) ? 1 : -1
                }

                return isSameAddress(a.address, defaultAddress) ? -1 : 1
            }) ?? EMPTY_LIST
        return uniqBy(result, (x) => x.address)
    }, [nextIdWallets, defaultAddress])
}
