import { useEffect, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { uniqBy } from 'lodash-unified'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { isSameAddress, isGreaterThan } from '@masknet/web3-shared-base'
import { MaskMessages } from '../../../../utils/index.js'
import type { Recipient } from '../../types/index.js'
import { useSettings } from './useSettings.js'

export function useOthersProofs(platform: NextIDPlatform, personaPubkey?: string): Recipient[] {
    const { value: settings } = useSettings(personaPubkey)
    const { value: nextIdWallets, retry: queryWallets } = useAsyncRetry(async (): Promise<Recipient[]> => {
        if (!personaPubkey) return EMPTY_LIST

        const bindings = await NextIDProof.queryExistedBindingByPersona(personaPubkey, true)
        if (!bindings) return EMPTY_LIST

        const wallets = bindings.proofs
            .filter((p) => p.platform === platform)
            .map((p) => ({ address: p.identity, verified: true, last_checked_at: p.last_checked_at }))
        return wallets
    }, [platform, personaPubkey])

    useEffect(() => {
        return MaskMessages.events.ownProofChanged.on(() => {
            queryWallets()
        })
    }, [])

    return useMemo(() => {
        const result =
            nextIdWallets
                ?.filter((x) => !settings?.hiddenAddresses?.some((y) => isSameAddress(y, x.address)) ?? true)
                .sort((a, z) => {
                    if (!a.last_checked_at || !z.last_checked_at) return 1
                    if (isGreaterThan(a.last_checked_at, z.last_checked_at)) {
                        return isSameAddress(z.address, settings?.defaultAddress) ? 1 : -1
                    }
                    return isSameAddress(a.address, settings?.defaultAddress) ? -1 : 1
                })
                .map((x) => ({ address: x.address, verified: true })) ?? EMPTY_LIST

        return uniqBy(result, (x) => x.address.toLowerCase())
    }, [nextIdWallets, settings?.hiddenAddresses])
}
